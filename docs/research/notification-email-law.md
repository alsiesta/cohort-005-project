# Research: What the law requires of Cadence's Notification emails

Question (issue #12): Which German/EU rules apply to Cadence's Notification emails? Is the opt-in toggle on `/settings` enough consent, or is Double-Opt-in needed? Are Announcements and "new lessons" advertising or transactional/existing-customer emails? What sender information must each email carry? Which retention and deletion rules apply to stored Notifications, email send logs and proof of consent?

**This is not legal advice.** It is a reading of statutes, court decisions and regulator guidance, checked on 2026-11-11. Points marked **(contested)** are not settled and a lawyer should confirm them before launch. The operator's legal form (GmbH, UG, sole trader...) was not known when this was written, and several answers depend on it.

Context: German operator, EU Students. Students opt in per kind of Notification on `/settings` (default off): Announcements (Platform Admin, Postmark broadcast stream), replies to their comment, new lessons on enrolled courses (one per course per day), Seat claimed on their Team Licence. A Refund Request decision is always emailed (no toggle). Each opt-in email has a one-click unsubscribe link per kind (no login) plus `List-Unsubscribe` headers. Notifications and send records live in SQLite with no deletion yet. Postmark (US, DPA with SCCs) sends.

## Short answers

| Question | Answer |
|---|---|
| Is the toggle enough? | Probably yes, **if the account's email address has been verified** (e.g. confirmation link at sign-up or login by email link). The point of Double-Opt-in is to prove that the owner of the address consented. If the address is not verified, send a confirmation email the first time a Student switches on any email kind (or verify the account email). **(contested: the DSK calls Double-Opt-in "geboten" for every electronic consent.)** |
| Does it differ by kind? | Yes in classification, but all four kinds are opt-in anyway. Announcements that promote courses are advertising and need consent. Comment replies, new lessons on a purchased course and Seat claimed are arguably service messages, but the courts read "Werbung" broadly, so treating them as consent-based (as now) is the safe path. |
| §7(3) UWG? | Not needed while every non-transactional email is opt-in. It would only matter if Cadence wanted to send course promotions to buyers without a toggle, and then only with an objection notice at collection and in every email. |
| Refund decision email without opt-in? | Fine. It answers the Student's own Refund Request and is not advertising. Keep it free of any promotion. It is likely a business letter with a 6-year retention duty. |
| Sender info per email | Identifiable sender in From/subject, a working unsubscribe/objection address, and if the operator is a company the Geschäftsbrief details (name, legal form, seat, register court and number, managing directors). Easiest: put the full Impressum data, or at least those details plus a link to the Impressum, in every email footer. |
| Retention | "Indefinitely" does not meet GDPR storage limitation. Define deletion periods per data type (proposal below). Keep proof of consent for as long as the consent is used, plus 3 years. |

## 1. Consent through the `/settings` toggle

### The legal requirement

- **UWG §7(2) Nr. 2**: advertising "unter Verwendung ... elektronischer Post" is always an unacceptable nuisance "ohne dass eine vorherige ausdrückliche Einwilligung des Adressaten vorliegt". Source: [§7 UWG](https://www.gesetze-im-internet.de/uwg_2004/__7.html). This implements Art. 13(1) of the ePrivacy Directive 2002/58/EC.
- **GDPR Art. 4(11), Art. 6(1)(a), Art. 7**: consent must be freely given, specific, informed and unambiguous, by a clear affirmative act. The controller "shall be able to demonstrate that the data subject has consented" (Art. 7(1)). Withdrawal must be possible at any time, the Student must be told so before consenting, and withdrawing must be as easy as giving consent (Art. 7(3)). Source: [GDPR, EUR-Lex](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679).
- **CJEU C-673/17 (Planet49), 1 Oct 2019**: a pre-ticked box is not valid consent. Cadence's toggles default to off, which meets this. Source: [CURIA C-673/17](https://curia.europa.eu/juris/liste.jsf?num=C-673/17).
- A per-kind toggle satisfies "specific" (one purpose per toggle). Each toggle needs a short explanation next to it (what is sent, how often, how to unsubscribe), per Art. 7(2)-(3) and Art. 13 GDPR.

### Double-Opt-in

- No statute requires Double-Opt-in by name. The requirement comes from the **burden of proof**: the sender must prove consent.
- **BGH, judgment of 10 Feb 2011, I ZR 164/09** ("Double-opt-in-Verfahren", GRUR 2011, 936): if an address was confirmed through Double-Opt-in, the consumer who still claims they never consented bears the burden of explaining why ("Darlegungslast"). If they show the confirmation did not come from them, the email was unlawful anyway. Electronically given consent must be stored and printable at any time. Sources: [dejure.org 2011,63](https://dejure.org/2011,63), [rewis.io](https://rewis.io/urteile/urteil/lul-09-02-2011-i-zr-16409/).
- **DSK Orientierungshilfe Direktwerbung (Feb 2022), section 3.3**: "Für das elektronische Erklären einer Einwilligung ist zur Verifizierung der Willenserklärung der betroffenen Person das Double-Opt-In-Verfahren geboten". The consent must be provable in full, including its wording. Storing an IP address alone is not enough. Source: [DSK OH Werbung, Februar 2022 (PDF)](https://www.datenschutzkonferenz-online.de/media/oh/OH-Werbung_Februar%202022_final.pdf).

**Applying this to Cadence (contested).** Double-Opt-in exists to stop someone typing a third party's address into a newsletter form. On Cadence, the Student switches the toggle while logged into their own account, and the email goes to that account's address. If that address was verified when the account was created (confirmation link, or login via email link), the address-ownership proof has already been made, and the logged-in toggle plus a consent log is a strong record. Most commentary accepts this. The DSK wording ("geboten" for electronic consents in general) is stricter, and a cautious reading would send a confirmation email anyway.

Recommendation:
- If account emails are verified: the toggle is enough. Log each consent (see section 4).
- If they are not verified (e.g. the DevUI / seed flow, or a future sign-up without confirmation): the first time a Student switches on any email kind, send a one-click confirmation email and only start sending once it is confirmed. One confirmation can cover all kinds if the email names them. That confirmation email itself must contain no advertising.
- When a Student changes their account email address, treat existing opt-ins as needing reconfirmation for the new address.

### Does it differ by kind?

"Werbung" is read very broadly. The DSK (OH section 1.1) uses the definition in Directive 2006/114/EC Art. 2(a), "jede Äußerung ... mit dem Ziel, den Absatz von Waren oder die Erbringung von Dienstleistungen ... zu fördern", and notes the courts treat even satisfaction surveys and birthday emails as advertising. **BGH VI ZR 225/17 (10 Jul 2018)**: a feedback request in an invoice email is advertising and needs consent or §7(3) UWG. **BGH VI ZR 134/15 (15 Dec 2015)**: advertising inside an automatic confirmation email, after the recipient objected, infringed their rights. Sources: [gesetze.co VI ZR 225/17](https://gesetze.co/urteile/VI_ZR_225-17), [gesetze.co VI ZR 134/15](https://gesetze.co/urteile/VI_ZR_134-15).

| Kind | Likely classification | Comment |
|---|---|---|
| Announcement | Advertising when it promotes courses, sales or the platform. A purely operational announcement (outage, changed terms) can be a service message. | Needs consent (as now). Because Platform Admins write free text, assume all Announcements are advertising. |
| Reply to their comment | Service message about the Student's own content. **(contested)** A platform also wants engagement, so a court could call it advertising. | Opt-in, as now, is safe either way. |
| New lesson on an enrolled course | Information about a course the Student already has; arguably performance of the contract (Art. 6(1)(b) GDPR). **(contested)** | Safe if opt-in and free of upsells ("you might also like..."). |
| Seat claimed on Team Licence | Information to the buyer about their purchase. Close to transactional. | Opt-in is fine. Could even be sent without a toggle, but keeping the toggle costs nothing. |

The practical consequence: since all four kinds are already opt-in, classification only matters for (a) how carefully consent must be proven and (b) the rule that a mail sent without consent must not carry promotional content.

### §7(3) UWG (existing-customer exception)

§7(3) allows email advertising without consent only if all four conditions hold: the address was obtained "im Zusammenhang mit dem Verkauf einer Ware oder Dienstleistung", it is used for "eigene ähnliche Waren oder Dienstleistungen", the customer has not objected, and the customer is told at collection and in every email that they can object at any time at basic transmission cost. Source: [§7 UWG](https://www.gesetze-im-internet.de/uwg_2004/__7.html). The DSK (OH 1.4.1) adds that the sender must be able to prove the address belongs to an existing customer (Art. 5(2) GDPR).

For Cadence it is not needed: every non-transactional kind is opt-in. It would only become relevant if Cadence later wanted to email course recommendations to buyers without a toggle. It would not cover Students who never bought anything, and "similar" products is read narrowly.

## 2. The Refund Request decision email

- It answers a request the Student made and reports the outcome of their contract. It is not "Werbung", so §7(2) UWG does not apply and no consent is needed. GDPR basis: Art. 6(1)(b) (contract/pre-contractual steps at the Student's request), possibly also Art. 6(1)(c).
- It must stay purely transactional. After VI ZR 225/17 and VI ZR 134/15, adding a course recommendation, survey or newsletter teaser turns it into advertising sent without consent.
- An unsubscribe link is not required for it and would be misleading (the Student cannot turn it off). A link to `/settings` for the optional kinds is fine.
- A refund decision is very likely a **Handelsbrief / Geschäftsbrief** (it concerns a commercial transaction). If the operator is a Kaufmann, a copy must be kept for **6 years**: [§257(1) Nr. 3, (4) HGB](https://www.gesetze-im-internet.de/hgb/__257.html); for tax purposes [§147(1) Nr. 3, (3) AO](https://www.gesetze-im-internet.de/ao_1977/__147.html). Postmark's own message retention is shorter than that, so Cadence must keep its own copy (or the data to reproduce it).

## 3. Sender and legal information in each email

- **§5 DDG (Impressum)** applies to the digital service: the information must be "leicht erkennbar, unmittelbar erreichbar und ständig verfügbar". It does not say in so many words that every email must carry an Impressum. Source: [§5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html). **(contested)** Some courts and commentators treat commercial emails (newsletters) as part of the service and expect the Impressum or a direct link in them. Low-cost safe practice: a footer with the Impressum data or a link "Impressum" to the page.
- **§6 DDG (commercial communications)**: commercial communications must be recognisable as such and the person on whose behalf they are sent must be identifiable. For email, neither sender nor commercial character may be concealed in the header or subject line. Source: [§6 DDG](https://www.gesetze-im-internet.de/ddg/__6.html). Relevant for Announcements: use a clear From name ("Cadence") and an honest subject line.
- **§7(2) Nr. 3 UWG**: advertising by email is always unlawful if the sender's identity is concealed, if it breaches §6(1) DDG, or if there is no valid address to which the recipient can send a request to stop. The per-kind unsubscribe link and a reply-capable address meet this. Source: [§7 UWG](https://www.gesetze-im-internet.de/uwg_2004/__7.html).
- **Geschäftsbrief details** (depending on legal form): a GmbH/UG must state legal form, seat, register court, register number and all managing directors on "allen Geschäftsbriefen gleichviel welcher Form, die an einen bestimmten Empfänger gerichtet werden" ([§35a GmbHG](https://www.gesetze-im-internet.de/gmbhg/__35a.html)); for registered merchants §37a HGB is the equivalent. Emails count as Geschäftsbriefe. §35a(2) exempts "Mitteilungen oder Berichte, die im Rahmen einer bestehenden Geschäftsverbindung ergehen und für die üblicherweise Vordrucke verwendet werden" **(contested whether automated notification emails fall under this exemption)**. Safe path: include these details in every footer.
- **GDPR**: no per-email duty, but the privacy policy must cover the email processing, Postmark as processor, the US transfer under SCCs, and retention periods (Art. 13(1)(e)-(f), 13(2)(a)). A privacy-policy link in the footer is good practice.
- **Not legal requirements but expected**: one-click `List-Unsubscribe` / `List-Unsubscribe-Post` (RFC 8058) is a mailbox-provider requirement for bulk senders (Gmail/Yahoo), not German law. Keep it for Announcements.
- **Open/click tracking**: if Postmark open tracking (pixel) or link tracking is switched on, that reads information from the Student's device, which needs consent under [§25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html) and is not covered by the email opt-in unless it says so. **(contested)** Simplest: turn tracking off.

Suggested footer for opt-in emails: operator name, address, legal form/register/managing directors (if company), contact email, links to Impressum and privacy policy, "Du erhältst diese E-Mail, weil du <Art> in deinen Einstellungen aktiviert hast", one-click unsubscribe for this kind, link to `/settings`.

## 4. Retention, deletion and proof of consent

### General rules

- **Art. 5(1)(e) GDPR (storage limitation)**: personal data may be kept "no longer than is necessary for the purposes". **Art. 17(1)(a)-(b)**: erasure once no longer necessary or after consent is withdrawn. **Art. 17(3)(b), (e)**: exceptions for legal obligations and legal claims. **Art. 13(2)(a)**: the privacy policy must state the retention period or the criteria for it. Storing everything "indefinitely" therefore needs to be replaced by defined periods before launch.
- No statute fixes a period for in-app notifications or send logs. The periods below are proposals based on purpose, not legal minimums.

### Proposal per data type

| Data | Purpose / basis | Suggested retention |
|---|---|---|
| In-app Notifications (inbox) | Providing the service, Art. 6(1)(b) | While useful to the Student, e.g. delete read ones after 6-12 months, all of them when the account is deleted. |
| Announcements (content) | Platform content | No personal data in the Announcement itself; per-Student read/unread rows follow the Notification rule. |
| Email send records for opt-in kinds (recipient, kind, timestamp, Postmark message ID, status, bounces) | Proof of what was sent under which consent, deliverability, Art. 6(1)(f) | Up to 3 years (civil limitation period, §195 BGB; aligns with DSK consent-proof period). A shorter period (e.g. 90 days for delivery status) plus a minimal "sent under consent X" record is also defensible. |
| Refund decision email (copy or reproducible data) | Business letter, Art. 6(1)(c) | 6 years from the end of the calendar year (§257(4), (5) HGB; §147(3), (4) AO), if the operator is a Kaufmann. |
| Consent / withdrawal log | Art. 7(1), 5(2) GDPR; basis for continued storage after withdrawal: Art. 6(1)(c) with 5(2)/7(1), and 6(1)(f) (DSK OH 3.7) | As long as the consent is used, plus 3 years after withdrawal or last email sent under it. |
| Postmark | Processor | Check Postmark's retention setting for message content/activity and keep it at or below Cadence's period. Postmark's suppression list should mirror Cadence's unsubscribes. |

The DSK (OH section 3.7) states the period for consent proof explicitly: consent must stay provable "auch nach einem Widerruf und der Löschung der personenbezogenen Daten aus der Werbe-Datenbank", "innerhalb der bußgeldrechtlichen und zivilrechtlichen Regelverjährungsfristen für Forderungen (3 Jahre, § 31 Abs. 2 Nr. 1 OWiG bzw. § 195 BGB)", and Students must be told about this continued storage when consent is collected. (The 5-year rule in [§7a UWG](https://www.gesetze-im-internet.de/uwg_2004/__7a.html) only covers telephone advertising.)

### What to log to prove an opt-in

From Art. 7(1) GDPR, BGH I ZR 164/09 and DSK OH 3.3/3.7 ("vollständig nachweisbar ..., auch hinsichtlich ihres Wortlauts"; stored and printable; IP address alone not enough), plus EDPB Guidelines 05/2020 on consent, section 5.1 "Demonstrate consent":

- Student (user ID) and the email address the consent applies to, at that moment.
- Kind of Notification.
- Action (granted / withdrawn) and timestamp.
- Where and how: `/settings` while logged in (session/authenticated user), or the unsubscribe link (which token), or a Double-Opt-in confirmation (when the confirmation link was sent and clicked).
- The exact consent text shown next to the toggle, as a version ID pointing to a stored copy of the wording.
- Whether and when the account email was verified (this is what carries the address-ownership proof).
- Append-only: keep history rather than overwriting a boolean, so the state on any past date can be reconstructed.

Unsubscribing: since Cadence's emails are consent-based, a withdrawal simply means "no consent, do not send". A separate "Werbesperrdatei" is only needed for advertising based on legitimate interest (DSK OH 5.1). The withdrawal entry in the consent log does the job.

## Open points for a lawyer

1. Whether a logged-in toggle on a verified account counts as sufficient proof without a separate Double-Opt-in email (DSK wording vs. purpose of the BGH case law).
2. Whether comment-reply and new-lesson emails are advertising.
3. Whether automated notification emails need the full §35a GmbHG / §37a HGB details, and whether an Impressum link in every email is expected.
4. Concrete retention periods for send logs and Notifications, to be written into the privacy policy.

## Sources

- UWG §7, §7a: https://www.gesetze-im-internet.de/uwg_2004/__7.html, https://www.gesetze-im-internet.de/uwg_2004/__7a.html
- DDG §5, §6: https://www.gesetze-im-internet.de/ddg/__5.html, https://www.gesetze-im-internet.de/ddg/__6.html
- TDDDG §25: https://www.gesetze-im-internet.de/ttdsg/__25.html
- GDPR (EU) 2016/679: https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679
- HGB §257: https://www.gesetze-im-internet.de/hgb/__257.html
- AO §147: https://www.gesetze-im-internet.de/ao_1977/__147.html
- GmbHG §35a: https://www.gesetze-im-internet.de/gmbhg/__35a.html
- BGH I ZR 164/09 (10 Feb 2011): https://dejure.org/2011,63
- BGH VI ZR 225/17 (10 Jul 2018): https://gesetze.co/urteile/VI_ZR_225-17
- BGH VI ZR 134/15 (15 Dec 2015): https://gesetze.co/urteile/VI_ZR_134-15
- CJEU C-673/17 Planet49 (1 Oct 2019): https://curia.europa.eu/juris/liste.jsf?num=C-673/17
- DSK, Orientierungshilfe Direktwerbung, Feb 2022, sections 1.1, 1.4.1, 3.3, 3.7, 5.1: https://www.datenschutzkonferenz-online.de/media/oh/OH-Werbung_Februar%202022_final.pdf
- EDPB Guidelines 05/2020 on consent, section 5.1: https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en
