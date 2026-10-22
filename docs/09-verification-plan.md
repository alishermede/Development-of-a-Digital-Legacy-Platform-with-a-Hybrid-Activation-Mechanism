# 9. Verification and Evaluation Plan

| Section | Responsible |
|---|---|
| 9.1 Test levels and tools, 9.2 Outcome metrics, 9.3 Baseline solution, 9.4 Evaluation scenarios and measurement conditions | Alisher Medebaev (DIP-21) |
| 9.5 Usability evaluation | Aibyn Samat (DIP-22) |

The plan shows how the aim of the project (`docs/01-proposal.md`, section 1.5) will be demonstrated: data is released only after a confirmed event, nobody but the recipients can read it, and false activations are rarer than in a simple dead man's switch. Every metric is linked to requirement IDs from `docs/06-requirements.md`.

## 9.1 Test levels and tools

| Level | What is tested | Tools | Requirements |
|---|---|---|---|
| Unit | Crypto Core (encryption, key derivation, splitting, sealed boxes, safety codes); rules of the state machine | Vitest (TypeScript), JUnit 5 (Java) | FR-CRY-01…12, FR-ACT-06 |
| Integration | REST API, PostgreSQL, Quartz timers, notification gateways replaced by test doubles | Spring Boot Test, Testcontainers (PostgreSQL) | FR-ACT-01…16, FR-INV-01…08, NFR-REL-01, NFR-REL-02 |
| Protocol simulation | Life scenarios of an owner with a controllable clock: months of check-ins, escalation, confirmations, waiting period and release in seconds | JUnit 5 with an injected `Clock` and the Quartz test scheduler | FR-ACT-03…15 |
| Security | Zero-knowledge property, key substitution, check-in tokens, rate limiting, access control of the Mini App endpoints | Own test suite, OWASP ZAP baseline scan | NFR-SEC-01…07, FR-CRY-11, FR-ACT-16 |
| Performance | Encryption, splitting and key derivation in real browsers and phones | Browser benchmark page, Playwright | NFR-PERF-01, NFR-PERF-02 |
| End-to-end | Scenarios S1–S8 of the prototype (section 8.1) on the running system | Playwright; Telegram test environment for the bot and Mini App | FR-OWN, FR-TRU, FR-NOT |
| Usability | See section 9.5 | — | NFR-USE-01…08 |

Cryptographic code uses only established libraries (NFR-SEC-02). Its tests therefore check **correct use** of the libraries — parameters, key separation, formats, error handling — not the primitives themselves. Known test vectors from RFC 9106 (Argon2id) and NIST SP 800-38D (AES-GCM) are used where they exist.

## 9.2 Outcome metrics

| ID | Metric | Target | How it is measured | Requirements |
|---|---|---|---|---|
| M1 | False activation rate: data released while the owner is alive and the trusted persons are honest | 0 in all scenarios of section 9.4 | Protocol simulation; count of scenarios that reach RELEASED although the owner is alive | FR-ACT-07, FR-ACT-08, FR-ACT-10 |
| M2 | Access to content with fewer than *k* shares or with a full copy of the server database | 0 successful attempts | Attempts to reconstruct the key from every combination of *k*−1 shares; decryption attempts with the database dump and server logs only | FR-CRY-04, NFR-SEC-01 |
| M3 | Detection of a substituted public key | 100% of substitutions detected when safety codes are compared | Security test: the server returns an attacker's key; the code shown to the owner differs from the code in the Mini App | FR-CRY-11 |
| M4 | Key reconstruction from *k* shares | 100% success in 1,000 random runs for every pair (*k*, *n*) with 2 ≤ *k* ≤ *n* ≤ 5 | Unit test with random keys | FR-CRY-04, FR-CRY-07 |
| M5 | Plaintext leakage | 0 occurrences | A unique "canary" string is stored in a capsule title and content, a test master password and a recovery key; the database dump, server logs and HTTP traffic are searched for them | NFR-SEC-01, NFR-SEC-07, FR-CRY-12 |
| M6 | Lost or duplicated timers after a server restart | 0 | Integration test: restart during CHECK-IN PENDING and WAITING PERIOD; timers fire once and no later than 1 hour after the due time | NFR-REL-01 |
| M7 | Time from the owner's death to release with default settings | Reported, not a target: 30 + 3 days + time to *k* confirmations + 7 days | Protocol simulation with confirmations after 1, 3 and 7 days | FR-ACT-01…05 |
| M8 | Notification delivery when one channel fails | 100% delivered through the remaining channels; at least 3 retries logged | Integration test with the SMS gateway double returning errors | NFR-REL-02 |
| M9 | Check-in token misuse | 0 accepted answers from a link preview, a used token or an expired token | Security test: GET without the button press, repeated POST, POST after expiry | FR-ACT-16 |
| M10 | Encryption and splitting of a 10 MB capsule | ≤ 3 s (median of 10 runs) | Benchmark page in Chrome on a mid-range laptop | NFR-PERF-01 |
| M11 | Argon2id key derivation | ≤ 2 s (median of 10 runs) | Benchmark page in the mobile browser and in the Mini App on a mid-range Android phone and an iPhone | NFR-PERF-02 |

M1–M3 and M5 carry the main claim of the project; the others check that the mechanism works reliably and fast enough.

## 9.3 Baseline solution

The baseline is a **simple dead man's switch**: data is released to the recipients after a fixed time of silence, with no trusted persons and no waiting period. This is how the timer-only services in section 4 (Cipherwill, Just In Case) and the formal dead man's switch in the literature (section 3.2.5) decide that the event happened.

For a fair comparison the baseline is obtained **from the same Activation Engine** with a different configuration: no confirmation step (*k* = 0) and a waiting period of 0 days. Both variants then share the same code for check-ins, escalation, timers and notifications, so the difference in results comes only from the rules of the hybrid activation and not from different implementations. The baseline configuration exists only in the test environment.

| Parameter | Baseline | Proposed system |
|---|---|---|
| Check-ins and escalation | Same (interval, +2, +1) | Same |
| Confirmation by trusted persons | None | *k* of *n*, default 2 |
| Waiting period with cancellation | None | 1–60 days, default 7 |
| Who can read the data | Recipients only (same encryption) | Recipients only |

## 9.4 Evaluation scenarios and measurement conditions

Each scenario is run in the protocol simulation for both configurations with a check-in interval of 7 days, *k* = 2 of *n* = 3 and a waiting period of 7 days.

| ID | Scenario | Expected result: baseline | Expected result: proposed system | Metric |
|---|---|---|---|---|
| E1 | Owner travels without connection for 14 days | Data released on day 10 (false activation) | No release: trusted persons know the owner is alive and do not confirm | M1 |
| E2 | Owner is in hospital for 30 days, trusted persons are unsure and one confirms | Data released on day 10 | No release with one confirmation; if *k* confirm, the owner can still cancel during the waiting period | M1 |
| E3 | Owner dies | Data released on day 10 | Data released after *k* confirmations and the waiting period (later than the baseline) | M7 |
| E4 | One trusted person falsely claims the death, the owner is alive and answers check-ins | Not applicable (no confirmation step) | No release: the process does not start and one confirmation is not enough | M1 |
| E5 | Two trusted persons collude while the owner is alive | Not applicable | Owner is notified every 24 hours during the waiting period and cancels | M1 |
| E6 | Server database and logs are stolen | No content readable (same encryption) | No content readable | M2, M5 |
| E7 | Malicious server substitutes a trusted person's public key | Not applicable | Detected by the safety code comparison | M3 |
| E8 | Server restarts during the escalation and the waiting period | Timers fire once | Timers fire once | M6 |
| E9 | Someone holding the owner's phone keeps answering "I'm OK" after the owner's death | Release delayed indefinitely | Release delayed as well, but the person cannot read the data | Limitation, recorded in the threat model (NFR-SEC-03) |

E9 is a limitation shared by both designs. It is reported openly: the proposed system protects the confidentiality of the data, but anybody who controls the owner's check-in channels can delay the release.

**Measurement conditions**

| Item | Condition |
|---|---|
| Test environment | Backend and PostgreSQL in Docker on one machine; notification gateways replaced by test doubles except in the end-to-end tests |
| Clock | Injected clock in the protocol simulation; real time in the end-to-end tests |
| Browsers | Latest stable Chrome and Safari at the time of the measurement; versions are recorded with the results |
| Devices | One mid-range Android phone and one iPhone for NFR-PERF-02 and the Mini App; models are recorded with the results |
| Repetitions | Performance: 10 runs, median reported; M4: 1,000 random runs per (*k*, *n*); scenarios E1–E9: each run once per configuration (the simulation is deterministic) |
| Data | Synthetic capsules and test accounts only; no real personal data |

Results are reported per metric as target, result and verdict (met, not met, not measurable), in the same format as the usability report (section 9.5). The comparison with the baseline (E1–E9) is the main evidence for the aim of the project.

## 9.5 Usability evaluation

*To be added in DIP-22 (Aibyn Samat).*
