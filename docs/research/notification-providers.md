# Research: Notification providers for Cadence

Question (issue #2): Which third-party approach fits Cadence's notification service?

1. A notification platform covering in-app feed, preferences and email (Knock, Novu, MagicBell, Courier).
2. An email-only provider (Resend, Postmark), with in-app notifications and per-recipient preferences built in-house in SQLite via Drizzle.

Context: React Router 8 (SSR, framework mode), React 19, SQLite via Drizzle (better-sqlite3), Tailwind, `sonner` already installed for toasts. Recipients are Students. Channels needed: in-app (one-time notice after login, banner, toast, inbox/feed) plus opt-in email.

This file reports facts only. The choice belongs to the follow-up ticket "Welchen Anbieter nehmen wir, und wie wird er angebunden?". Sources were checked on 2026-11-10. Pricing pages change often; re-check before deciding.

## Summary table

| | Knock | Novu | MagicBell | Courier | Resend (+ in-house) | Postmark (+ in-house) |
|---|---|---|---|---|---|---|
| In-app feed React components | Yes: `@knocklabs/react` (`NotificationFeedPopover`, `NotificationFeed`, `NotificationIconButton`) | Yes: `@novu/react` (`Inbox`, `Bell`, `Notifications`, `InboxContent`, `Preferences`), React 18+/19 | Yes: `@magicbell/react` (`FloatingInbox`, `Inbox`, `InlineNotification`, `ToastContainer`, `UserPreferences`) | Yes: Inbox, Toasts, Preferences SDKs for React 18+ | None: build in-house | None: build in-house |
| Preferences | Built in (all plans). No prebuilt UI component; guide builds one on `getPreferences`/`setPreferences` | Built in, `<Preferences />` component | `UserPreferences` component (channels per category) | Built-in preference center | Build in-house (SQLite) | Build in-house (SQLite) |
| Email delivery | Orchestration only; routes through a provider you connect | Via connected providers | Via connected providers | Via connected providers | Own email API | Own email API |
| EU data residency | Not yet. Docs: "expect to support EU data residency by the end of 2026". SCCs + DPF | Yes: "US + EU data residency" listed on Free plan | Not stated on pricing/security pages; GDPR + DPA claimed | Yes: EU datacenter (eu-west-1). Pricing lists it under Business; docs say provisioned by arrangement | Sending region eu-west-1 available, but all account data, logs and metadata stored in US | Servers in US (Chicago + AWS); no EU plans. DPA with SCCs |
| Free tier | 10,000 messages/month | 10,000 workflow runs/month, 5 workflows | 1,000 deliveries/month | 10,000 sends/month | 3,000 emails/month, max 100/day | 100 emails/month |
| First paid tier | Starter $250/month | Pro from $30/month | Startup $249/month (50k deliveries) | Business $0.005/send pay-as-you-go | Pro $20/month (50k emails) | Basic $15/month (10k emails) |
| Self-hosting | Not offered | Yes: community self-hosted (MongoDB + Redis); some features cloud-only; MIT outside `enterprise/packages` | Not mentioned | Not mentioned | n/a (in-house part lives in our SQLite) | n/a |
| Local development | Knock CLI pulls/pushes workflows as code; no local emulator documented | `npx novu dev` tunnels Novu Cloud to local bridge; or self-host locally | Not documented | Not researched in depth | Test addresses `delivered@resend.dev` etc. (count against quota) | `POSTMARK_API_TEST` token: validates without delivering |

## Platform option

### Knock

- Plans: Free $0 (10,000 messages/month), Starter $250/month plus usage, Enterprise custom. Feeds and user preferences (channels, notifications, categories) are on all plans; per-tenant preferences are Enterprise-only. Source: https://knock.app/pricing
- React: `@knocklabs/react` (built on `@knocklabs/client`) with `NotificationFeedPopover`, `NotificationFeed`, `NotificationIconButton`. `@knocklabs/react-notification-feed` is the older, superseded package. The overview page has no SSR notes. Source: https://docs.knock.app/in-app-ui/react/overview
- Preferences UI: no prebuilt component. The guide builds a `PreferenceCenter` with `knockClient.user.getPreferences()`/`setPreferences()`. Source: https://docs.knock.app/in-app-ui/react/preferences
- EU residency: "We expect to support EU data residency by the end of 2026." Source: https://docs.knock.app/manage-your-account/knock-plans. EU transfers rely on SCCs and DPF certification. Source: https://knock.app/legal/privacy-policy
- Email: Knock orchestrates. You connect an email provider (e.g. Resend, Postmark) as a channel.
- Local dev: Knock CLI (`@knocklabs/cli`) pulls workflows and templates to the repo and pushes them through CI between environments. No local emulator documented. Source: https://docs.knock.app/developer-tools/knock-cli

### Novu

- Plans: Free $0 (10,000 workflow runs/month, up to 5 workflows, 2 environments, 3 team members, "US + EU data residency"), Pro from $30/month (30k+ runs, removes Novu branding), Team from $250/month, Enterprise custom. Source: https://novu.co/pricing
- React: `@novu/react`, React 18.0.0+ (React 19 supported). Components: `Inbox`, `Bell`, `Notifications`, `InboxContent`, `Preferences`. The overview has no SSR notes; there is a Next.js quickstart. Source: https://docs.novu.co/platform/inbox/overview
- Self-hosting: community self-hosted edition. Requirements: MongoDB and Redis (AOF on). A single VM needs 4 vCPU / 8 GB RAM, plus S3-compatible storage. Source: https://docs.novu.co/community/self-hosting-novu/overview
- Cloud-only features include more than 2 environments, translations, removing Novu branding (inbox and email), snooze, email activity tracking, SSO/MFA/RBAC, and compliance certifications. Self-hosted keeps all channels, Inbox/Preferences components, digest and workflows, but allows only 1 team member. Source: https://docs.novu.co/community/self-hosted-and-novu-cloud
- License: `LICENSE-MIT` for the repo, except `enterprise/packages`, which is under `EE-PACKAGES-LICENSE`. Source: https://github.com/novuhq/novu/blob/next/LICENSE-ENTERPRISE
- Local dev: `npx novu@latest dev` opens the Cloud dashboard in a "Local" environment and tunnels Cloud requests to a local bridge endpoint (default `http://localhost:4000/api/novu`). "Nothing in the Local environment is stored in Novu Cloud." This needs a Novu Cloud account and secret key. Source: https://docs.novu.co/framework/studio

### MagicBell

- Plans: Builder $0 (1,000 deliveries/month, 1 project), Startup $249/month (50,000 deliveries, $0.0025 per extra delivery), Enterprise custom. Source: https://www.magicbell.com/pricing
- React: `@magicbell/react` with `ContextProvider` (user JWT), `FloatingInbox`, `Inbox`, `InlineNotification`, `ToastContainer`, `UserPreferences`, plus Slack and WebPush buttons. The page states no React version requirement and has no SSR notes. Source: https://www.magicbell.com/docs/libraries/magicbell-react
- EU / GDPR: the Trust Centre claims GDPR compliance and DPAs but names no hosting region. Source: https://www.magicbell.com/security
- Self-hosting: not mentioned.

### Courier

- Plans: Developer free (10,000 sends/month), Business $0.005/send pay-as-you-go, Enterprise custom. The pricing page lists "EU Data Residency" as a Business feature. Source: https://www.courier.com/pricing
- In-app: Inbox (unread counts, read/archive, actions, pagination), Toasts and Preferences, synced in real time. SDKs for React 18+ (and 17) and Web Components. Old `@trycourier/react-inbox`/`react-provider`/`components` are deprecated. Auth: the backend issues a JWT and the client calls `signIn`. Source: https://www.courier.com/docs/platform/inbox/inbox-overview
- EU: "Your data stays in the datacenter you send it through, US or EU." Source: https://www.courier.com/docs/workspaces/security. EU base URL `https://api.eu.courier.com`. A Courier blog says the EU datacenter is for Enterprise customers, which conflicts with the pricing page. Source: https://www.courier.com/blog/eu-data-residency-notifications
- Self-hosting: not mentioned.

## Email-only option (in-house in-app + preferences)

### Resend

- Plans (transactional): Free 3,000 emails/month, capped at 100/day; Pro $20/month for 50,000 emails. Unsubscribe handling for `/emails` API sends is up to you (visible link plus `List-Unsubscribe` and `List-Unsubscribe-Post` headers). Permanent bounces are auto-suppressed. Source: https://resend.com/pricing
- Regions: us-east-1, eu-west-1 (Ireland), sa-east-1, ap-northeast-1. The region controls only where mail is sent from: "All account data, including email metadata, logs, and API records, is stored in the United States." Source: https://resend.com/docs/dashboard/domains/regions
- SDK: `resend` npm package, `resend.emails.send({ from, to, subject, html | react })`. It accepts React Email components (Node.js only). Source: https://resend.com/docs/send-with-nodejs
- Local dev: test recipients `delivered@`, `bounced@`, `complained@`, `suppressed@resend.dev`. They count against the quota. Source: https://resend.com/docs/dashboard/emails/send-test-emails

### Postmark

- Plans: Free 100 emails/month (no overages); Basic $15/month for 10,000 emails; Pro $16.50; Platform $18. Transactional and broadcast streams are kept separate. Source: https://postmarkapp.com/pricing
- Data location: Deft data center near Chicago plus AWS; "no current plans" for EU servers. A DPA with updated SCCs is part of the ToS. Source: https://postmarkapp.com/eu-privacy
- Local dev: the `POSTMARK_API_TEST` server token validates requests without delivering. Source: https://postmarkapp.com/developer/api/overview

### What "in-house" means in this stack (no external source; derived from the issue)

- Feed/inbox, the one-time notice after login, and banners become Drizzle tables (e.g. notifications, read state, preferences) in the existing SQLite file, rendered via React Router loaders/actions. That fits SSR natively, with no client-only SDK or JWT handshake.
- Toasts can reuse the already installed `sonner`.
- Preference storage, unsubscribe links and List-Unsubscribe headers for opt-in email are our own code. Real-time push (websocket) is not included. A feed refreshes on navigation or polling unless that is built.

## Notes relevant to SSR fit

- None of the checked platform React overview pages (Knock, Novu, MagicBell, Courier) document React Router SSR specifically. All four authenticate the browser client with a user token or JWT issued by our backend, and render client-side.
- Two platforms document EU data residency today: Novu (Free plan) and Courier (Business/Enterprise, provisioned by arrangement). Knock plans it for end of 2026. MagicBell names no region. Resend sends from the EU but stores data in the US. Postmark is US-only.
