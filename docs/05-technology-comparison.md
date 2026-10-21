# 5. Technology Comparison

Each key decision compares 2–3 alternatives against criteria derived from the requirements (`docs/06-requirements.md`). Scores: 1 (poor) – 5 (excellent).

| Section | Responsible |
|---|---|
| 5.1–5.5 Server platform, data storage, cryptographic libraries, component interaction, summary | Alisher Medebaev (DIP-12) |
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

**Decision:** Java 21 with Spring Boot 3.

**Rationale:** under the zero-knowledge architecture (NFR-SEC-01) all encryption happens in the browser, so the server language does not need cryptographic libraries. The server's main job is to run the activation state machine reliably. Its correctness depends on transactions, persistent timers and security, which are the strengths of Spring (Spring Data JPA, Spring Security, Quartz). The difference in languages between frontend and backend is covered by generating a TypeScript client from the OpenAPI specification.

## 5.2 Data storage

| Criterion | Related requirements | PostgreSQL + S3-compatible object storage | PostgreSQL only (encrypted blobs in `bytea`) | MongoDB |
|---|---|---|---|---|
| ACID transactions for state machine transitions | FR-ACT-06, FR-ACT-08 | 5 | 5 | 3 |
| Storage of large encrypted files (photos, documents) | FR-CRY-01 | 5 | 2 | 3 |
| Relational integrity (owners, trusted persons, capsules, shares) | FR-CRY-05, FR-ACT-04 | 5 | 5 | 2 |
| Persistent job store in the same database | NFR-REL-01 | 5 | 5 | 2 |
| Operational simplicity | — | 3 | 5 | 4 |
| **Total** | | **23** | 22 | 14 |

**Decision:** PostgreSQL for metadata, encrypted shares, activation state and scheduler jobs; S3-compatible object storage (e.g. MinIO) for encrypted capsule files.

**Rationale:** the activation logic requires strict transactional transitions (a confirmation and a state change must happen atomically). Large encrypted files in the database would make backups heavy, so they are stored as objects referenced from PostgreSQL. Only ciphertext is stored in both places (NFR-SEC-01).

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

| Criterion | libsodium.js `crypto_pwhash` (Argon2id) | argon2-browser (WASM) | PBKDF2 (WebCrypto) |
|---|---|---|---|
| Memory-hard algorithm (resistance to GPU brute force) | 5 | 5 | 1 |
| Already used for other operations (one dependency) | 5 | 2 | 4 |
| Maintenance status | 5 | 3 | 5 |
| **Total** | **15** | 10 | 10 |

### c) Public-key encryption of shares (FR-CRY-03, FR-CRY-05, FR-CRY-06)

| Criterion | libsodium.js sealed boxes (X25519) | WebCrypto ECDH + AES-GCM | OpenPGP.js |
|---|---|---|---|
| Ready primitive for "encrypt to a public key" | 5 | 2 | 4 |
| Consistent support in all browsers | 5 | 3 | 5 |
| Simplicity, small risk of misuse | 5 | 2 | 3 |
| **Total** | **15** | 7 | 12 |

### d) Shamir's Secret Sharing (FR-CRY-04)

| Criterion | `shamir-secret-sharing` (Privy) | `secrets.js-grempe` | Own implementation over GF(256) |
|---|---|---|---|
| Independent security audit | 5 (audited by Cure53) | 1 | 1 |
| Dependencies | 5 (none) | 4 | 5 |
| Maintenance status | 4 | 2 | — |
| Compliance with NFR-SEC-02 | yes | yes | **no** |
| **Total** | **14** | 7 | excluded |

**Decision:** WebCrypto API for AES-256-GCM; libsodium.js for Argon2id and X25519 sealed boxes; `shamir-secret-sharing` for key splitting.

**Rationale:** the browser's native AES-GCM is the fastest option and keeps keys non-extractable. libsodium covers the operations that WebCrypto lacks or supports unevenly. The Shamir library is the only option with a public independent audit. An own implementation is excluded by NFR-SEC-02; known implementation pitfalls (for example, a zero leading coefficient reducing the effective threshold) are another argument against writing it ourselves.

## 5.4 Component interaction

### a) Client–server API

| Criterion | Related requirements | REST + OpenAPI | GraphQL | tRPC |
|---|---|---|---|---|
| Simple to document and demonstrate (API examples) | DIP-20 | 5 | 3 | 2 |
| Per-endpoint rate limiting | NFR-SEC-05 | 5 | 2 | 4 |
| Binary upload of encrypted files | FR-CRY-01 | 5 | 2 | 3 |
| Independent of client technology (web, Telegram bot, offline tool) | FR-CRY-09, FR-ACT-02 | 5 | 4 | 1 |
| Support in Java / Spring | — | 5 (Spring Web, springdoc-openapi) | 4 | 1 |
| **Total** | | **25** | 15 | 11 |

**Decision:** REST API described with OpenAPI (springdoc-openapi); the TypeScript client for the frontend is generated from the specification.

**Rationale:** REST is the easiest to document, secure per endpoint and use from different clients (web application, Telegram bot, offline recovery tool). tRPC is excluded because it requires TypeScript on both sides.

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

## 5.5 Summary of decisions

| Decision | Choice |
|---|---|
| Server platform | Java 21 + Spring Boot 3 |
| Data storage | PostgreSQL (Spring Data JPA) + S3-compatible object storage |
| Capsule encryption | WebCrypto API (AES-256-GCM), in the browser |
| Key derivation | libsodium.js (Argon2id), in the browser |
| Share encryption | libsodium.js sealed boxes (X25519), in the browser |
| Secret sharing | `shamir-secret-sharing` (audited), in the browser |
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
