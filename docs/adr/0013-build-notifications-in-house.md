# Build Notifications in-house, with Postmark only for email

Notifications and Announcements, whether a Student has read them, and which kinds a Student wants emailed all live in Cadence's own SQLite file, rendered through React Router loaders and actions. Postmark, which already sends the Refund Request emails, stays the only third party and only delivers email. We first wanted a notification platform to handle all of this. We dropped it once the UI was settled: Cadence draws its own login dialog, inbox sidebar and settings section, and a Student can unsubscribe from an email without logging in. That would have left a platform doing little more than storage and routing, at the cost of a second service, a JWT handshake, client-only rendering with no documented React Router SSR support, and work against its components.

## Considered Options

- **Novu Cloud.** The best of the platforms: EU hosting on the free plan and Inbox/Preferences components. Rejected for the reasons above. Its components would have to be bent to our design or replaced, and it still needs Postmark to send email.
- **Knock, MagicBell, Courier.** Rejected: around $250/month for the first paid tier, and no EU hosting on their basic plans.
- **Resend instead of Postmark.** Rejected: it can send from the EU but keeps account data and logs in the US, so it gains little over Postmark, which is already wired in.

## Consequences

There is no real-time push. An open page only learns about a new Notification by revalidating or polling. Sending one Announcement's emails to many Students is our job too: batching them, picking Postmark's broadcast or transactional stream, and handling failures. Email data sits with Postmark in the US under its DPA. Moving to a platform later means moving the notification history and preferences out of SQLite.

Research behind this decision: `docs/research/notification-providers.md` on the `research/notification-providers` branch.
