# Tests

Automated tests and test materials. The test levels, metrics M1–M12 (including M1b) and evaluation scenarios E1–E11 are defined in `docs/09-verification-plan.md`; usability materials are in `docs/usability/`.

| Folder (planned) | Content |
|---|---|
| `crypto/` | Unit tests of the Crypto Core, known test vectors (RFC 9106, NIST SP 800-38D) |
| `backend/` | Integration tests with Testcontainers (PostgreSQL), state machine and timer tests |
| `simulation/` | Protocol simulation of scenarios E1–E11 with a controllable clock, baseline comparison |
| `e2e/` | Playwright scenarios S1–S8 |

## Pre-defense design model

Run `node tests/simulation/pre-defense-model.cjs` from the repository root. It creates `docs/verification/pre-defense-model-results.md`: seeded M1b sensitivity cells and notification outage/recovery/cancellation guard checks. This standalone design model is not the backend implementation, a cryptographic proof, a gateway integration test or a performance benchmark.
