import { describe, it, expect } from "vitest";
import {
  REFUND_WINDOW_DAYS,
  buildRefundRequestedEmail,
  checkRefundEligibility,
  getRefundableAmount,
  lastDayOfRefundWindow,
  type RefundEligibilityFacts,
} from "./refunds";

// A purchase that passes every rule. Each test breaks exactly one.
function eligibleFacts(
  overrides: Partial<RefundEligibilityFacts> = {}
): RefundEligibilityFacts {
  return {
    purchasedAt: new Date(2026, 10, 1, 12, 0),
    today: new Date(2026, 10, 5, 12, 0),
    secondsWatched: 0,
    completedLessons: 0,
    totalLessons: 10,
    isClaimedTeamSeat: false,
    hasRequestedRefundRequest: false,
    ...overrides,
  };
}

describe("Refund Window", () => {
  it("lasts fourteen calendar days", () => {
    expect(REFUND_WINDOW_DAYS).toBe(14);
  });

  it("ends on the fourteenth calendar day after the purchase", () => {
    expect(lastDayOfRefundWindow(new Date(2026, 10, 1, 23, 0))).toBe(
      "2026-11-15"
    );
  });
});

describe("checkRefundEligibility", () => {
  it("is eligible when every rule holds", () => {
    expect(checkRefundEligibility(eligibleFacts())).toEqual({
      eligible: true,
    });
  });

  it("is still eligible for the whole of the last day of the window", () => {
    // Bought at 23:00, so the window counts whole days, not hours.
    const facts = eligibleFacts({
      purchasedAt: new Date(2026, 10, 1, 23, 0),
      today: new Date(2026, 10, 15, 23, 59),
    });
    expect(checkRefundEligibility(facts)).toEqual({ eligible: true });
  });

  it("is not eligible the day after the window closes", () => {
    const facts = eligibleFacts({ today: new Date(2026, 10, 16, 0, 1) });
    expect(checkRefundEligibility(facts)).toEqual({
      eligible: false,
      reason: "outside_window",
    });
  });

  it("is not eligible before the purchase day", () => {
    const facts = eligibleFacts({ today: new Date(2026, 9, 31, 12, 0) });
    expect(checkRefundEligibility(facts)).toEqual({
      eligible: false,
      reason: "outside_window",
    });
  });

  it("is not eligible once two hours have been watched", () => {
    const facts = eligibleFacts({ secondsWatched: 2 * 60 * 60 });
    expect(checkRefundEligibility(facts)).toEqual({
      eligible: false,
      reason: "watched_too_much",
    });
  });

  it("is still eligible just under two hours watched", () => {
    const facts = eligibleFacts({ secondsWatched: 2 * 60 * 60 - 1 });
    expect(checkRefundEligibility(facts)).toEqual({ eligible: true });
  });

  it("is not eligible once half of the lessons are completed", () => {
    const facts = eligibleFacts({ completedLessons: 5, totalLessons: 10 });
    expect(checkRefundEligibility(facts)).toEqual({
      eligible: false,
      reason: "completed_too_much",
    });
  });

  it("is still eligible just under half of the lessons completed", () => {
    const facts = eligibleFacts({ completedLessons: 4, totalLessons: 10 });
    expect(checkRefundEligibility(facts)).toEqual({ eligible: true });
  });

  it("ignores the completion limit for a course with no lessons", () => {
    const facts = eligibleFacts({ completedLessons: 0, totalLessons: 0 });
    expect(checkRefundEligibility(facts)).toEqual({ eligible: true });
  });

  it("is not eligible for a claimed team seat", () => {
    const facts = eligibleFacts({ isClaimedTeamSeat: true });
    expect(checkRefundEligibility(facts)).toEqual({
      eligible: false,
      reason: "claimed_team_seat",
    });
  });

  it("is not eligible while a Refund Request is already Requested", () => {
    // Reported first: the learner has already asked, which explains more
    // than any other rule would.
    const facts = eligibleFacts({
      hasRequestedRefundRequest: true,
      secondsWatched: 10 * 60 * 60,
    });
    expect(checkRefundEligibility(facts)).toEqual({
      eligible: false,
      reason: "already_requested",
    });
  });
});

describe("getRefundableAmount", () => {
  it("is what the learner actually paid, not the list price", () => {
    // A coupon purchase: paid 1500 for a course listed at 4900.
    expect(getRefundableAmount({ amountPaid: 1500 })).toBe(1500);
  });
});

describe("buildRefundRequestedEmail", () => {
  const email = buildRefundRequestedEmail({
    learnerName: "Ada",
    learnerEmail: "ada@example.com",
    courseTitle: "Intro to Rust",
    amount: 1500,
  });

  it("is addressed to the learner", () => {
    expect(email.to).toBe("ada@example.com");
  });

  it("uses the same label the learner sees on screen", () => {
    expect(email.subject).toBe("Refund requested — Intro to Rust");
  });

  it("states the Refundable Amount", () => {
    expect(email.body).toContain("$15.00");
  });

  it("never uses the retired words", () => {
    const text = `${email.subject}\n${email.body}`;
    expect(text).not.toMatch(/reversal|chargeback|pending|cancel/i);
  });
});
