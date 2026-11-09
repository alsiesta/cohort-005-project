// ─── Refunds ───
// The rules for when a learner may make a Refund Request, and how much they
// get back. Terms follow GLOSSARY.md.
//
// Imported by routes on both sides of the bundle, so nothing here may touch
// the database or the request. The facts are gathered in refunds.server.ts.

import { formatPrice } from "~/lib/utils";

/** The Refund Window: calendar days after the purchase, counted inclusively. */
export const REFUND_WINDOW_DAYS = 14;

/** Watching this much of the course, or more, ends Refund Eligibility. */
export const REFUND_WATCH_LIMIT_SECONDS = 2 * 60 * 60;

/** Completing this share of the lessons, or more, ends Refund Eligibility. */
export const REFUND_COMPLETION_LIMIT = 0.5;

// Compare whole days, not hours — a purchase at 23:00 should still get its
// full fourteenth day.
export function calendarDay(when: Date): string {
  const year = when.getFullYear();
  const month = String(when.getMonth() + 1).padStart(2, "0");
  const day = String(when.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** The last calendar day, as YYYY-MM-DD, on which a Refund Request is allowed. */
export function lastDayOfRefundWindow(purchasedAt: Date): string {
  const deadline = new Date(purchasedAt);
  deadline.setDate(deadline.getDate() + REFUND_WINDOW_DAYS);
  return calendarDay(deadline);
}

export type RefundEligibilityFacts = {
  purchasedAt: Date;
  today: Date;
  secondsWatched: number;
  completedLessons: number;
  totalLessons: number;
  isClaimedTeamSeat: boolean;
  hasRequestedRefundRequest: boolean;
};

export type RefundIneligibleReason =
  | "already_requested"
  | "claimed_team_seat"
  | "outside_window"
  | "watched_too_much"
  | "completed_too_much";

export type RefundEligibility =
  | { eligible: true }
  | { eligible: false; reason: RefundIneligibleReason };

/** What the learner is told when they are not eligible. */
export const REFUND_INELIGIBLE_MESSAGES: Record<RefundIneligibleReason, string> =
  {
    already_requested: "You already have a refund requested for this purchase.",
    claimed_team_seat: "A claimed team seat cannot be refunded.",
    outside_window: `The ${REFUND_WINDOW_DAYS}-day refund window has closed.`,
    watched_too_much:
      "You have watched too much of this course to request a refund.",
    completed_too_much:
      "You have completed too much of this course to request a refund.",
  };

/** Refund Eligibility, as defined in GLOSSARY.md. */
export function checkRefundEligibility(
  facts: RefundEligibilityFacts
): RefundEligibility {
  if (facts.hasRequestedRefundRequest) {
    return { eligible: false, reason: "already_requested" };
  }

  if (facts.isClaimedTeamSeat) {
    return { eligible: false, reason: "claimed_team_seat" };
  }

  const today = calendarDay(facts.today);
  const isWithinWindow =
    today >= calendarDay(facts.purchasedAt) &&
    today <= lastDayOfRefundWindow(facts.purchasedAt);

  if (!isWithinWindow) {
    return { eligible: false, reason: "outside_window" };
  }

  if (facts.secondsWatched >= REFUND_WATCH_LIMIT_SECONDS) {
    return { eligible: false, reason: "watched_too_much" };
  }

  if (
    facts.totalLessons > 0 &&
    facts.completedLessons / facts.totalLessons >= REFUND_COMPLETION_LIMIT
  ) {
    return { eligible: false, reason: "completed_too_much" };
  }

  return { eligible: true };
}

/** The Refundable Amount: always what was actually paid, never the list price. */
export function getRefundableAmount(purchase: { amountPaid: number }): number {
  return purchase.amountPaid;
}

/**
 * The confirmation the learner gets in their inbox. There is no mail
 * transport wired up yet, so the built message goes to the server log.
 */
export function buildRefundRequestedEmail(input: {
  learnerName: string;
  learnerEmail: string;
  courseTitle: string;
  amount: number;
}) {
  return {
    to: input.learnerEmail,
    subject: `Refund requested — ${input.courseTitle}`,
    body: [
      `Hi ${input.learnerName},`,
      "",
      `We have your refund request for "${input.courseTitle}".`,
      `If it is approved, we will refund ${formatPrice(input.amount)}, the amount you paid, to the card you paid with.`,
      "",
      "Our team reviews every refund request by hand. You do not need to do anything else. We will email you again once we have decided.",
      "",
      "— The Cadence team",
    ].join("\n"),
  };
}
