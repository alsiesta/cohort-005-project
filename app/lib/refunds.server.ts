// Gathers the facts Refund Eligibility depends on, for a learner's latest
// Purchase of a course. The rules themselves live in refunds.ts.

import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "~/db";
import {
  coupons,
  lessonProgress,
  lessons,
  modules,
  purchases,
  refunds,
  videoWatchEvents,
  LessonProgressStatus,
  RefundStatus,
} from "~/db/schema";
import {
  checkRefundEligibility,
  getRefundableAmount,
  type RefundEligibility,
} from "~/lib/refunds";

function getLatestPurchase(userId: number, courseId: number) {
  return db
    .select()
    .from(purchases)
    .where(and(eq(purchases.userId, userId), eq(purchases.courseId, courseId)))
    .orderBy(sql`${purchases.createdAt} desc`)
    .get();
}

function getLessonIds(courseId: number): number[] {
  return db
    .select({ id: lessons.id })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(eq(modules.courseId, courseId))
    .all()
    .map((row) => row.id);
}

function getCompletedLessonCount(userId: number, lessonIds: number[]) {
  if (lessonIds.length === 0) return 0;

  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.status, LessonProgressStatus.Completed),
        inArray(lessonProgress.lessonId, lessonIds)
      )
    )
    .get();

  return result?.count ?? 0;
}

// The furthest point reached in each lesson, summed — rewatching a lesson
// does not count twice.
function getSecondsWatched(userId: number, lessonIds: number[]) {
  if (lessonIds.length === 0) return 0;

  return db
    .select({
      furthest: sql<number>`max(${videoWatchEvents.positionSeconds})`,
    })
    .from(videoWatchEvents)
    .where(
      and(
        eq(videoWatchEvents.userId, userId),
        inArray(videoWatchEvents.lessonId, lessonIds)
      )
    )
    .groupBy(videoWatchEvents.lessonId)
    .all()
    .reduce((total, row) => total + row.furthest, 0);
}

// A seat that came out of a team licence, and has been claimed, belongs to
// the team — the learner cannot hand it back on their own.
function isClaimedTeamSeat(purchaseId: number) {
  const claimed = db
    .select({ id: coupons.id })
    .from(coupons)
    .where(
      and(eq(coupons.purchaseId, purchaseId), isNotNull(coupons.redeemedAt))
    )
    .get();

  return claimed !== undefined;
}

function hasRequestedRefundRequest(purchaseId: number) {
  const requested = db
    .select({ id: refunds.id })
    .from(refunds)
    .where(
      and(
        eq(refunds.purchaseId, purchaseId),
        eq(refunds.status, RefundStatus.Requested)
      )
    )
    .get();

  return requested !== undefined;
}

export type PurchaseRefundEligibility = {
  purchaseId: number;
  refundableAmount: number;
  eligibility: RefundEligibility;
};

/**
 * Refund Eligibility for the learner's latest Purchase of a course, or null
 * if they have not bought it.
 */
export function getRefundEligibility(
  userId: number,
  courseId: number,
  today: Date = new Date()
): PurchaseRefundEligibility | null {
  const purchase = getLatestPurchase(userId, courseId);

  if (!purchase) return null;

  const lessonIds = getLessonIds(courseId);

  const eligibility = checkRefundEligibility({
    purchasedAt: new Date(purchase.createdAt),
    today,
    secondsWatched: getSecondsWatched(userId, lessonIds),
    completedLessons: getCompletedLessonCount(userId, lessonIds),
    totalLessons: lessonIds.length,
    isClaimedTeamSeat: isClaimedTeamSeat(purchase.id),
    hasRequestedRefundRequest: hasRequestedRefundRequest(purchase.id),
  });

  return {
    purchaseId: purchase.id,
    refundableAmount: getRefundableAmount(purchase),
    eligibility,
  };
}
