# DIP-33: Mini App entry point and Android storage probe

26 November 2026. Owner: Aibyn Samat. Status: frontend foundation; backend authentication and Android device evidence pending.

Open `/mini.html` on the frontend dev server. The owner dashboard remains `/`. Both HTML entry points are included in the Vite production build. The Mini App loads the official Telegram bridge, calls ready/expand, detects launch data without parsing or trusting it, and offers a harmless SecureStorage probe only on Android with API 9.0+ and an available storage object. No initData is logged or persisted. No backend endpoint is invented.

Official contract: https://core.telegram.org/bots/webapps (Initializing Mini Apps, SecureStorage, Validating data received via the Mini App), consulted 26 November 2026. Raw initData must be validated on the backend; initDataUnsafe is not authentication. SecureStorage support alone does not prove security of the client or cryptographic protocol.

## Implemented diagnostic

Explicit user action writes a random, non-secret marker to the dedicated `mura_probe` key, reads and compares it, then removes it. It never writes private keys, shares, contacts, account identifiers or sessions, and never falls back to localStorage. API callbacks have a five-second timeout; errors and failed cleanup are shown rather than reported as success. The fixed probe key is reserved for diagnostics. A late SDK callback after timeout can race cleanup; therefore repeat/inspect cleanup on a real device and never use this diagnostic as key-lifecycle evidence.

Browser preview shows unavailable capabilities and disabled diagnostic. It cannot authenticate, accept invitations, confirm an event or release data. Successful mocked tests establish adapter behavior only.

## Next integration steps

1. Agree backend auth contract with Alisher: raw initData verification, freshness/replay policy, session issuance and error handling. Bot token stays server-side. All privileged requests need server authorization.
2. Configure an HTTPS staging URL ending in `/mini.html` in the test bot. No new hosting or bot configuration was performed in this iteration.
3. Run the explicit probe on actual Android Telegram. Record device/OS/Telegram version, date, storage support, write/read/remove and errors. Test unsupported client, denied/failed operations, offline behavior and close/reopen. Use only harmless markers until key design and account binding are reviewed.
4. Separately implement and verify real key-share persistence, account switching, deletion/recovery lifecycle and consent-based invitation flows. This probe is not that implementation.

## Evidence

Unit tests: `npm test` in src/frontend, including rejection of unsupported platform/API, write failure, read mismatch, read error cleanup and cleanup failure. Build: `npm run build` includes both entry points. Actual Android tests: NOT RUN. Server authentication: NOT IMPLEMENTED. Browser visual inspection: NOT RUN in this iteration.
