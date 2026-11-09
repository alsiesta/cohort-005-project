# Course Platform

A marketplace where learners buy courses, watch lessons, and can ask for their money back shortly after buying.

## Language

### Refunds

**Refund Request**:
A learner's request to get their money back for one Purchase, along with the reason they gave. An Admin decides it.
_Avoid_: Reversal, Chargeback, Cancellation, cancel my purchase

**Refund Request states**:
**Requested** (waiting for an Admin to decide), **Approved** (money will be returned), **Declined** (nothing will be returned). A Purchase can have only one Requested Refund Request at a time.
_Avoid_: Pending, Open, Raised

**Refund**:
One attempt to return the Refundable Amount for an Approved Refund Request. A Refund is never partial. If an attempt fails, an Approved Refund Request can have more than one Refund.
_Avoid_: Reversal, Chargeback, partial refund

**Refund states**:
**Processing** (sent to the payment processor, not yet confirmed), **Issued** (the processor confirmed the money moved), **Failed** (the processor did not move the money).
_Avoid_: Pending, Completed, Done

**Refundable Amount**:
What the learner actually paid for the Purchase, not the course's list price.
_Avoid_: Refund price, list price

**Refund Window**:
The 14 calendar days after a Purchase, counted inclusively, when a learner may make a Refund Request.
_Avoid_: Cancel window, cancellation period

**Refund Eligibility**:
Whether a learner may make a Refund Request for a Purchase. It requires all of these: the Refund Window is still open, the learner has watched less than 2 hours and completed less than half of the lessons, the Purchase is not a claimed team seat, and no Refund Request for it is Requested.
_Avoid_: Cancellation offer, cancellable

**Chargeback**:
A payment dispute the cardholder opens through their bank instead of with us. The platform does not model Chargebacks.
_Avoid_: Using this word for a Refund Request or a Refund

### Learner-facing wording

Learners see one combined label, the same on screen and in email: **Refund requested**, **Refund approved** (Approved, with a Refund Processing), **Refunded** (Issued), **Refund declined**, **Refund failed – we're retrying**. The action is **Request a refund**.

## Relationships

- A **Purchase** has zero or more **Refund Requests**, and at most one of them is Requested at a time.
- An **Approved** Refund Request has one or more **Refunds**. A new Refund is only created after the previous one Failed.
- The learner keeps access to the course until a Refund is **Issued**. Access ends at that point.
- A Refund Request can be made again after a **Decline**, as long as Refund Eligibility still holds.
