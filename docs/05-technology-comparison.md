# 5. Technology Comparison

Each key decision compares 2–3 alternatives against criteria derived from the requirements (`docs/06-requirements.md`). Scores: 1 (poor) – 5 (excellent).

| Section | Responsible |
|---|---|
| 5.1–5.5 Server platform, data storage, cryptographic libraries and key storage, component interaction, summary | Alisher Medebaev (DIP-12) |
| 5.6–5.7 Frontend framework, notification services | Aibyn Samat (DIP-13) |

## 5.1 Server platform

| Criterion | Related requirements | Java + Spring Boot | Node.js + NestJS (TypeScript) | Python + FastAPI |
|---|---|---|---|---|
| Transaction management for state machine transitions | FR-ACT-06, FR-ACT-08 | 5 (Spring `@Transactional`) | 3 | 3 |
| Security framework (authentication, 2FA, rate limiting) | NFR-SEC-04…06 | 5 (Spring Security, Bucket4j) | 4 | 3 |
| Reliable persistent scheduling | FR-ACT-03, NFR-REL-01 | 5 (Quartz) | 4 | 3 |
| Strong static typing and long-term maintainability | — | 5 | 4 | 3 |
| Development speed for a 2-person team | — | 3 | 5 | 4 |
| Team experience | — | 4 | 4 | 3 |
| **Total** | | **27** | 24 | 19 |

**Decision:** Java 21 with Spring Boot 4.1.

**Rationale:** under the zero-knowledge architecture (NFR-SEC-01) all encryption happens in the browser, so the server language does not need cryptographic libraries. The server's main job is to run the activation state machine reliably. Its correctness depends on transactions, persistent timers and security, which are the strengths of Spring (Spring Data JPA, Spring Security, Quartz). The difference in languages between frontend and backend is covered by generating a TypeScript client from the OpenAPI specification.

**Version:** Spring Boot 3.5 reached the end of open-source support on 30 June 2026, so the project starts on Spring Boot 4.1, the current stable line recommended for new projects. Spring Boot 4 requires Java 17 or later; Java 21 (LTS) is used.

## 5.2 Data storage

Capsules mostly contain credentials, instructions, messages and a limited number of photos and documents (up to 50 MB per capsule, NFR-CAP-01). All files are encrypted in the browser before upload.

| Criterion | Related requirements | PostgreSQL only (encrypted files in `bytea`) | PostgreSQL + encrypted files on the server file system | PostgreSQL + S3-compatible object storage |
|---|---|---|---|---|
| ACID transactions for state machine transitions | FR-ACT-06, FR-ACT-08 | 5 | 5 | 5 |
| File and its metadata saved or deleted atomically | FR-ACT-10 | 5 | 2 | 2 |
| Storage of encrypted files up to 50 MB per capsule | NFR-CAP-01 | 4 | 5 | 5 |
| One backup covers all data | — | 5 | 3 | 2 |
| No extra infrastructure, no cost | — | 5 | 4 | 2 (extra service or paid cloud) |
| All data on one server in Kazakhstan | NFR-LAW-01 | 5 | 5 | 3 |
| Scalability to large volumes | — | 2 | 3 | 5 |
| **Total** | | **31** | 27 | 24 |

**Decision:** PostgreSQL only: metadata, encrypted shares, activation state, scheduler jobs and encrypted capsule files.

**Rationale:** for capsules limited to 50 MB, storing encrypted files in the database keeps every change transactional (for example, deleting a capsule removes its files in the same transaction), needs one backup and no extra service or cost. Object storage scales better but is not needed at this volume. File access is hidden behind a `FileStorage` interface, so an S3-compatible storage can be added later without changing the rest of the system. Only ciphertext is stored (NFR-SEC-01).

## 5.3 Cryptographic libraries

All operations run in the browser (NFR-SEC-01); only established implementations are allowed (NFR-SEC-02).

### a) Symmetric encryption of capsules (FR-CRY-01)

| Criterion | WebCrypto API (AES-256-GCM) | libsodium.js (XChaCha20-Poly1305) | node-forge / SJCL |
|---|---|---|---|
| Built into browsers, no extra code | 5 | 2 | 2 |
| Performance on large files | 5 | 4 | 2 |
| Non-extractable keys | 5 | 2 | 1 |
| Maintenance status | 5 | 5 | 2 |
| **Total** | **20** | 13 | 7 |

### b) Key derivation from the master password (FR-CRY-02)

| Criterion | libsodium.js `crypto_pwhash` (Argon2id, `libsodium-wrappers-sumo`) | argon2-browser (WASM) | PBKDF2 (WebCrypto) |
|---|---|---|---|
| Memory-hard algorithm (resistance to GPU brute force) | 5 | 5 | 1 |
| Already used for other operations (one dependency) | 5 | 2 | 4 |
| Maintenance status | 5 | 3 | 5 |
| **Total** | **15** | 10 | 10 |

Note: `crypto_pwhash` is included only in the sumo build of libsodium.js (`libsodium-wrappers-sumo`), so this build is used.

### c) Public-key encryption of shares (FR-CRY-03, FR-CRY-05, FR-CRY-06)

| Criterion | libsodium.js sealed boxes (X25519) | WebCrypto ECDH + AES-GCM | OpenPGP.js |
|---|---|---|---|
| Ready primitive for "encrypt to a public key" | 5 | 2 | 4 |
| Consistent support in browsers and Telegram WebView | 5 | 4 (X25519 in all major browsers since 2025, missing in older versions) | 5 |
| Simplicity, small risk of misuse | 5 | 2 | 3 |
| **Total** | **15** | 8 | 12 |

### d) Shamir's Secret Sharing (FR-CRY-04)

| Criterion | `shamir-secret-sharing` (Privy) | `secrets.js-grempe` | Own implementation over GF(256) |
|---|---|---|---|
| Independent security audit | 5 (audited by Cure53 and Zellic) | 1 | 1 |
| Dependencies | 5 (none) | 4 | 5 |
| Maintenance status | 4 | 2 | — |
| Compliance with NFR-SEC-02 | yes | yes | **no** |
| **Total** | **14** | 7 | excluded |

Note: the selected library requires at least 2 shares and a threshold of at least 2, which is standard for Shamir's scheme (with *k* = 1 the polynomial is a constant, so every share equals the secret). Therefore *k* = 1 is handled without splitting: the capsule key is encrypted separately for each trusted person (FR-CRY-04).

**Decision:** WebCrypto API for AES-256-GCM; libsodium.js (`libsodium-wrappers-sumo`) for Argon2id and X25519 sealed boxes; `shamir-secret-sharing` for key splitting when *k* ≥ 2.

**Rationale:** the browser's native AES-GCM is the fastest option and keeps keys non-extractable. libsodium covers the operations that WebCrypto lacks or supports unevenly. The Shamir library is the only option with a public independent audit. An own implementation is excluded by NFR-SEC-02; known implementation pitfalls (for example, a zero leading coefficient reducing the effective threshold) are another argument against writing it ourselves.

### e) Storage of the private key of trusted persons and recipients (FR-CRY-03a, FR-INV-01)

Trusted persons and recipients have no account, so their private key cannot be protected by a password-derived key as for the owner.

| Criterion | Telegram SecureStorage (Keychain / Keystore) | Telegram CloudStorage | Telegram DeviceStorage | Browser IndexedDB in a separate web cabinet |
|---|---|---|---|---|
| Key stays on the user's device | 5 | 1 (stored on Telegram servers) | 5 | 5 |
| Hardware-backed protection at rest | 5 | 1 | 2 | 2 |
| Works without registration in our system | 5 | 5 | 5 | 1 |
| Survives reinstall / device change | 2 (restore only on the same device) | 5 | 1 | 1 |
| Client support | 3 (mobile clients; desktop to be verified) | 5 | 4 | 5 |
| **Total** | **20** | 17 | 17 | 14 |

**Decision:** Telegram SecureStorage.

**Rationale:** it is the only option where the key stays on the device in hardware-backed storage and no registration is needed. CloudStorage would let Telegram hold the keys, which breaks the zero-knowledge property. The weak point — loss of the key when the phone is replaced — is covered by periodic key checks and re-creation of shares (FR-CRY-10, FR-CRY-08).

## 5.4 Component interaction

### a) Client–server API

| Criterion | Related requirements | REST + OpenAPI | GraphQL | tRPC |
|---|---|---|---|---|
| Simple to document and demonstrate (API examples) | DIP-20 | 5 | 3 | 2 |
| Per-endpoint rate limiting | NFR-SEC-05 | 5 | 2 | 4 |
| Binary upload of encrypted files | FR-CRY-01 | 5 | 2 | 3 |
| Independent of client technology (web application, Telegram bot and Mini App) | FR-INV-01, FR-ACT-02 | 5 | 4 | 1 |
| Support in Java / Spring | — | 5 (Spring Web, springdoc-openapi) | 4 | 1 |
| **Total** | | **25** | 15 | 11 |

**Decision:** REST API described with OpenAPI (springdoc-openapi); the TypeScript client for the frontend is generated from the specification.

**Rationale:** REST is the easiest to document, secure per endpoint and use from different clients (web application, Telegram bot and Mini App). tRPC is excluded because it requires TypeScript on both sides.

### b) Timers and background jobs (check-ins, escalation, waiting period, notifications)

| Criterion | Related requirements | Quartz Scheduler (JDBC JobStore in PostgreSQL) | JobRunr | Spring `@Scheduled` |
|---|---|---|---|---|
| Jobs survive server restart | NFR-REL-01 | 5 | 5 | 1 |
| Transactional with state changes (same database and transaction) | FR-ACT-06 | 5 | 3 | 2 |
| Retries for failed notifications | NFR-REL-02 | 4 | 5 | 1 |
| Maturity and documentation | — | 5 | 4 | 5 |
| No extra infrastructure | — | 5 | 5 | 5 |
| **Total** | | **24** | 22 | 14 |

**Decision:** Quartz Scheduler with JDBC JobStore in the same PostgreSQL database.

**Rationale:** when Quartz uses the application's data source, it takes part in Spring-managed transactions. A timer is therefore created or cancelled in the same transaction as the activation state change, and a restart cannot lose or duplicate a step. JobRunr is more convenient for retries, but it does not provide the same transactional coupling.

### c) Client for trusted persons and recipients (FR-INV-01…05)

| Criterion | Related requirements | Telegram bot + Mini App | Separate web cabinet with registration | Telegram bot messages only (no Mini App) |
|---|---|---|---|---|
| No registration required | FR-INV-01 | 5 | 1 | 5 |
| Client-side cryptography possible (WebCrypto, libsodium) | FR-CRY-03a, FR-CRY-06 | 5 | 5 | 1 |
| Secure on-device key storage | FR-CRY-03a | 5 (SecureStorage) | 3 | 1 |
| Phone number verification | FR-INV-05 | 5 (contact sharing) | 3 (SMS code) | 5 |
| Familiarity for users in Kazakhstan | — | 5 | 3 | 5 |
| **Total** | | **25** | 15 | 17 |

**Decision:** Telegram bot (Telegram Bot API) for invitations, check-ins and notifications, and a Telegram Mini App for all cryptographic operations of trusted persons and recipients.

**Rationale:** bot messages alone cannot run cryptography on the device, and a separate web cabinet requires registration. The Mini App runs the same web cryptography code as the owner's web application. Limitation: a bot cannot write first (CON-01), so invitations are sent by SMS and optionally by the owner from their own Telegram account.

## 5.5 Summary of decisions

| Decision | Choice |
|---|---|
| Server platform | Java 21 + Spring Boot 4.1 |
| Data storage | PostgreSQL (Spring Data JPA), encrypted files in `bytea` behind a `FileStorage` interface |
| Capsule encryption | WebCrypto API (AES-256-GCM), in the browser |
| Key derivation | libsodium.js `libsodium-wrappers-sumo` (Argon2id), in the browser |
| Share encryption | libsodium.js sealed boxes (X25519), in the browser and Mini App |
| Secret sharing | `shamir-secret-sharing` (audited by Cure53 and Zellic) for *k* ≥ 2; no splitting for *k* = 1 |
| Key storage of trusted persons and recipients | Telegram SecureStorage |
| Client for trusted persons and recipients | Telegram bot + Telegram Mini App |
| Client–server API | REST + OpenAPI (springdoc-openapi), generated TypeScript client |
| Background jobs | Quartz Scheduler (JDBC JobStore) |
| Rate limiting | Bucket4j |
| Frontend framework | React with TypeScript, built with Vite as a single-page application; the Telegram Mini App is a second entry point of the same code base |
| Notification services | SMS: SMSC.kz (HTTP API); email: Resend (SMTP via Spring Mail); Telegram: Bot API with the TelegramBots library (webhook); WhatsApp not used in this version |

## 5.6 Frontend framework

The frontend has two entry points built from one code base: the owner web application and the Telegram Mini App for trusted persons and recipients (section 5.4c). Both run all cryptography in the browser (NFR-SEC-01).

| Criterion | Related requirements | React + Vite (single-page application) | Next.js (React) | Vue 3 + Vite |
|---|---|---|---|---|
| One code base for the owner web application and the Mini App | FR-CRY-06, FR-CRY-07, FR-INV-01 | 5 | 3 | 5 |
| Tooling for Telegram Mini Apps | FR-CRY-03a, FR-INV-01 | 5 (official React template, SDK package and TelegramUI component library) [17][18] | 4 (same React libraries, but the official template does not target Next.js) | 3 (official Vue binding of the SDK, no UI kit found) [16] |
| No server-side JavaScript inside the trust boundary | NFR-SEC-01, NFR-SEC-07 | 5 (static files only) | 3 (server rendering needs a Node server; a static export removes the benefit of Next.js) | 5 |
| Browser-only crypto libraries (WebCrypto, libsodium WASM) | FR-CRY-01…07 | 5 | 3 (must be kept out of server rendering) | 5 |
| Kazakh and Russian localization | NFR-L10N-01, NFR-L10N-02 | 5 (react-i18next) | 5 (next-intl) | 5 (vue-i18n) |
| Responsive and accessible components | NFR-USE-07, NFR-USE-08 | 5 | 5 | 4 |
| Deployment | — | 5 (static files behind any web server) | 3 (Node runtime or static export) | 5 |
| Familiarity of the team | — | 4 | 4 | 3 |
| **Total** | | **39** | 30 | 35 |

**Decision:** React with TypeScript, built with Vite as a single-page application. The Mini App is a second entry point of the same code base and uses the Telegram Mini Apps SDK for React and the TelegramUI components.

**Rationale:** the application has no public pages that need search indexing, and every sensitive operation happens in the browser. Server rendering therefore adds a Node server to the trust boundary and a rule that crypto code must never run on it, without giving anything back. A single-page application is a set of static files, so the Spring Boot backend stays the only server component. React has the most complete tooling for Mini Apps among the three options. The TypeScript API client is generated from the OpenAPI specification (section 5.4a).

**Limitations:** the first page load needs JavaScript, which is acceptable for an application behind a login. The component library for the owner web application is chosen at the implementation stage; TelegramUI is used only in the Mini App. The score for team familiarity is the authors' own judgement.

## 5.7 Notification services (SMS, Telegram, email)

The notification catalogue is in section 6.7 (FR-NOT-01). SMS and Telegram carry check-ins and invitations (FR-ACT-02, FR-INV-02), email carries owner notifications (FR-ACT-09). Every provider is hidden behind an interface (`SmsGateway`, `EmailGateway`, `TelegramGateway`), so it can be replaced without changing the activation logic.

### 5.7.1 SMS gateway

A message to a phone number in Kazakhstan costs far less through a local provider. SMSC.kz lists prices per message including VAT of 12.10 to 23.50 tenge at the lowest volume plan, depending on the operator and the type of traffic [10]; Twilio lists $0.3382 per segment [21]. Infobip and Sinch are not compared: a secondary source lists them at $0.20–0.24 per segment [20], which is again several times the local price.

| Criterion | Related requirements | SMSC.kz | Twilio |
|---|---|---|---|
| Price per SMS to numbers in Kazakhstan | F-12 (willingness to pay) | 5 (12.10–23.50 tenge) | 1 ($0.3382 per segment) |
| Starting without registering an own sender name | FR-INV-02, FR-ACT-02 | 5 (common sender names SMSC.KZ, INFORM and InfoSMS are free) [10] | 2 (alphanumeric sender ID is pre-registered, about 3 weeks; a dynamic sender ID is not preserved) [12] |
| Payment in tenge, invoices with VAT | — | 5 | 2 |
| API and delivery reports | NFR-REL-02, FR-ACT-09 | 4 (HTTP and JSON API, delivery status by request, available for one day) [11] | 5 (mature SDKs, status callbacks) |
| Kazakh and Russian text | NFR-L10N-03 | 4 (UTF-8, 70 characters per message, 67 when split) [11] | 4 (UCS-2 supported, segment length not stated) [12] |
| **Total** | | **23** | 14 |

**Decision:** SMSC.kz through its HTTP API, with the free common sender name at the start. An own sender name costs a monthly fee per operator (14,500 tenge for K'cell, 17,500 for Beeline, 20,800 for Tele2 and Altel) [10] and takes about three weeks to register [12], so it is left for the production stage.

**Cost estimate:** with the default check-in interval of 30 days, an owner generates 12 check-in SMS per year, plus up to 5 invitations. At the highest listed price of 23.50 tenge this is about 400 tenge per owner per year, far below the 500–1000 tenge per month that respondents named (F-12, preliminary). If the owner is silent, a full activation adds 3 check-ins and about one SMS per day of the waiting period.

**Limitations:** the prices are for the lowest volume plan and were read on 22.10.2026. SMS in Kazakhstan has a 70-character limit per Cyrillic message, so templates are kept short (NFR-L10N-03). Where the provider stores logs, and whether this conflicts with NFR-LAW-01, is not confirmed and goes into the risk register.

### 5.7.2 Email service

Email carries only owner notifications, such as the confirmation of registration and the waiting-period alerts (FR-ACT-09). It is not a check-in channel (FR-ACT-02), because one respondent may not open email for a week (F-05). The volume is small.

| Criterion | Related requirements | Resend | Amazon SES | Own mail server (Postfix) |
|---|---|---|---|---|
| Cost at the expected volume | — | 5 (free plan: 3,000 emails per month) [15] | 4 ($0.10 per 1,000 emails, no free plan) [15] | 3 (server and time) |
| Setup and maintenance effort | — | 5 | 3 | 1 (SPF, DKIM, DMARC, IP reputation) |
| Delivery to common mailboxes | FR-ACT-09 | 4 | 4 | 2 |
| Standard SMTP access from Spring | NFR-REL-02 | 5 | 5 | 5 |
| Data stays in Kazakhstan | NFR-LAW-01 | 2 | 2 | 5 |
| **Total** | | **21** | 18 | 16 |

**Decision:** Resend, used through standard SMTP from Spring Mail, so SES or an own server can be connected by changing the configuration.

**Rationale:** it is the cheapest and fastest option to set up. The messages contain no capsule data, keys or titles (FR-NOT-07), only the owner's email address and a short text.

**Limitations:** the email address of the owner passes through a provider outside Kazakhstan, which is recorded as a risk for NFR-LAW-01 (a Should requirement). The daily sending limit of the free plan must be checked before the demo.

### 5.7.3 Telegram bot integration

Telegram has no cost for the bot. A bot can send about 30 messages per second to different users, and no more than one message per second to one chat [13]. This is enough for the planned volume, but the integration must handle HTTP 429 and retry (NFR-REL-02).

| Criterion | Related requirements | TelegramBots library with Spring Boot webhook starter | Direct Bot API calls from Spring | Separate Node.js bot service (grammY) |
|---|---|---|---|---|
| Same runtime and one deployment as the backend | — | 5 | 5 | 2 |
| Same transaction and scheduler as the activation state machine | FR-ACT-06, NFR-REL-01 | 5 | 5 | 2 (calls between two services) |
| Effort for commands, buttons, contact sharing | FR-INV-04, FR-INV-05 | 5 | 2 (own types and update parsing) | 4 |
| Webhook support | NFR-REL-01 | 5 (webhook module and starter) [19] | 4 | 5 |
| Dependency risk | NFR-SEC-02 | 3 (community library) | 5 (no extra dependency) | 4 |
| **Total** | | **23** | 21 | 17 |

**Decision:** the TelegramBots library with its Spring Boot webhook starter, behind a `TelegramGateway` interface.

**Rationale:** the bot needs no secrets of its own: keys stay in the Mini App (section 5.3e), and the bot only sends messages and receives button presses. Running it inside the backend keeps timers, state changes and notifications in one transaction.

**Limitations:** compatibility of the library with Spring Boot 4.1 is not checked yet and is the first task of the prototype. If it fails, the fallback is direct Bot API calls behind the same interface. A bot cannot write first (CON-01), so the first contact is always an SMS invitation.

### 5.7.4 WhatsApp as an additional channel

One respondent named WhatsApp for check-ins (F-05), and trusted persons without Telegram would be unable to take part (F-16). Two options are compared.

| Criterion | Related requirements | Telegram and SMS only | Add the WhatsApp Business Platform |
|---|---|---|---|
| Trusted persons can store a key on the device and decrypt | FR-CRY-03a, FR-CRY-06 | 5 (Mini App with SecureStorage) | 1 (no equivalent of the Mini App) |
| Cost | F-12 | 4 (Telegram free, SMS 12–24 tenge) | 2 (each delivered template message is charged; Kazakhstan is a separate price market since 1 October 2026) [14] |
| Setup effort | — | 4 | 2 (business-initiated messages need approved templates) [14] |
| Reach of owners who prefer WhatsApp | F-05 | 3 (SMS reaches all three respondents) | 4 |
| **Total** | | **16** | 9 |

**Decision:** Telegram and SMS only. WhatsApp stays in the list of future improvements (FR-NOT-11, priority Won't) and may be reconsidered for owner notifications, where no key storage is needed.

**Limitations:** the rate for Kazakhstan was not read, because the page links to rate cards instead of listing figures [14]. A relative without Telegram cannot take part in this version. The cabinet warns the owner and recommends *n* greater than *k* (FR-OWN-13).

### 5.7.5 Summary

| Channel | Used for | Receivers | Provider and integration |
|---|---|---|---|
| SMS | Invitations, check-ins, fallback notifications | Owner, trusted persons, recipients | SMSC.kz, HTTP API |
| Telegram | Check-ins, confirmation requests, notifications, Mini App | Owner, trusted persons, recipients | Bot API, TelegramBots library with webhook |
| Email | Registration, waiting-period alerts | Owner | Resend through SMTP |
| WhatsApp | Not used in this version | — | Future work |

## References

1. Cure53, "Audit report: Privy SSS library." https://cure53.de/audit-report_privy-sss-library.pdf
2. `shamir-secret-sharing` package. https://www.npmjs.com/package/shamir-secret-sharing
3. Privy, "Shamir secret sharing deep dive." https://privy.io/blog/shamir-secret-sharing-deep-dive
4. Privy, "Zero leading coefficients." https://privy.io/blog/zero-leading-coefficients-cryptography
5. `shamir-secret-sharing` README (constraints and audits). https://unpkg.com/shamir-secret-sharing@0.0.4/README.md
6. libsodium.js README (standard and sumo builds). https://cdn.jsdelivr.net/npm/libsodium-wrappers-sumo@0.8.4/README.md
7. Telegram, "Telegram Mini Apps" (SecureStorage, CloudStorage, DeviceStorage). https://core.telegram.org/bots/webapps
8. HeroDevs, "Spring Boot versions, EOL dates and latest releases." https://www.herodevs.com/blog-posts/spring-boot-versions-eol-dates-and-latest-releases-april-2026
9. J. Fernández, "Can I use Secure Curves in the Web Platform?" Igalia. https://blogs.igalia.com/jfernandez/?p=1913
10. SMSC.kz, "Tariffs" (accessed 22.10.2026). https://smsc.kz/tariffs/
11. SMSC.kz, "HTTP API" (accessed 22.10.2026). https://smsc.kz/api/http/?lang=en
12. Twilio, "Kazakhstan SMS guidelines" (accessed 22.10.2026). https://www.twilio.com/en-us/guidelines/kz/sms
13. Telegram, "Bots FAQ" (accessed 22.10.2026). https://core.telegram.org/bots/faq
14. Meta, "Pricing on the WhatsApp Business Platform" (accessed 22.10.2026). https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing.md
15. CostBench, "Amazon SES vs Resend pricing" (accessed 22.10.2026). https://costbench.com/compare/amazon-ses-vs-resend/
16. Telegram Mini Apps documentation, "@telegram-apps/sdk-vue" (accessed 22.10.2026). https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-vue
17. Telegram Mini Apps, React template (accessed 22.10.2026). https://github.com/Telegram-Mini-Apps/reactjs-js-template
18. Telegram Mini Apps, TelegramUI component library (accessed 22.10.2026). https://github.com/telegram-mini-apps-dev/TelegramUI
19. rubenlagus, TelegramBots Java library (accessed 22.10.2026). https://github.com/rubenlagus/TelegramBots
20. Sent.dm, "Kazakhstan SMS pricing", secondary source (accessed 22.10.2026). https://sent.dm/en/resources/sms-pricing/kazakhstan-sms-pricing
21. Twilio, "SMS pricing for Kazakhstan" (accessed 22.10.2026). https://www.twilio.com/en-us/sms/pricing/kz
