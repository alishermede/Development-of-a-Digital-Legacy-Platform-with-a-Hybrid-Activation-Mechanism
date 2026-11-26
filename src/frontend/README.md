# MURA frontend

First owner-web interface, built with React, TypeScript and Vite. Responsible: Aibyn Samat. This is an interactive UI foundation; it is not the end-to-end prototype required by the committee yet.

## Run

From `src/frontend` with Node.js 22.12+ (verified on Node.js 24):

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. The development server listens on loopback only.

```sh
npm run build
npm test
npm run preview
```

## Available in this iteration

- Responsive Russian owner dashboard with capsule cards, check-in action and activity feed.
- Capsule collection with search, status filtering and empty state.
- Four-step creation flow: title/content/file-name examples, synthetic recipient, conditions and review. Creates an in-memory draft and a session event. Per-capsule conditions are retained on the draft.
- Trusted-person and recipient roles, accepted/pending invitation examples.
- Check-in interval (1-180 days), waiting period (1-60 days), threshold validation against accepted trustees and at least one enabled delivery channel.
- Capsule detail with explicitly labelled demo controls for waiting/outage states and cancellation confirmation.
- Help and notifications dialogs, keyboard focus containment, Escape dismissal, reduced-motion styling and mobile navigation.

All state is in memory and resets on reload. Selected files retain their names only: no file bytes are read or uploaded. Do not enter real secrets or personal data. Google Fonts supplies typography, with system fallbacks if unavailable.

## Integration boundaries

No API calls, authentication, cryptography, actual invitations, timers or delivery/release are implemented. The phrase typed into the cancellation dialog is a UI confirmation, **not authentication**. Demo switches can change a draft's displayed phase; they are not protocol transitions or security evidence. The Telegram Mini App is a later entry point, not implemented here.

Before using real data:

1. Agree API and error shapes with Alisher using `prototype/api/openapi.yaml`. Never post plaintext capsule titles, contents, master passwords or private keys to that API.
2. Connect the reviewed crypto-core adapter before enabling network writes. Do not substitute browser storage or a frontend-only encryption claim.
3. Load server-authoritative readiness and activation states; remove demo controls. Authenticate cancellation per the agreed protocol and handle rejection, stale versions, delivery faults and retry states.
4. Implement registration/login/recovery, consent-based invitations, real file encryption/upload, arming, Telegram entry point and Kazakh localization. Legal deployment gates remain those in docs/12.
5. Run and record integration/security tests. UI/model tests are not proof of secure hybrid activation.

## Verification on 7 November 2026

Production build and six domain tests pass. Tests cover invalid thresholds, absent channels, boundary settings, cancellation from waiting/paused and rejection when there is no pending release. Browser smoke checks: required title, four-step draft creation, retained note/recipient/conditions, outage view, cancellation confirmation, mobile navigation and invalid threshold rejection. Desktop and 390 px mobile layouts visually inspected; no horizontal document overflow observed at that mobile width.

Requirements informing this iteration: docs/08 S2-S4, FR-OWN, FR-NOT-13/14 and NFR-USE. More scenarios remain to implement; this is not a completion claim for those requirement groups.

## Telegram Mini App foundation (26 November 2026)

Open /mini.html for the separate recipient/trustee entry point. It provides launch detection and an explicit harmless Android SecureStorage diagnostic; server authentication and real flows remain pending. No launch identity is trusted client-side. Both owner and Mini App pages are built. See docs/verification/dip33/mini-app.md for device checks, limitations and API source. The earlier statement that no Mini App entry point exists describes the initial owner-only version.
