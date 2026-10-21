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
| Frontend framework | Section 5.6 (DIP-13) |
| Notification services | Section 5.7 (DIP-13) |

## 5.6 Frontend framework

*To be added in DIP-13.*

## 5.7 Notification services (SMS, Telegram, email)

*To be added in DIP-13.*

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
