# Tests

Automated tests and test materials. The test levels, metrics M1–M11 and evaluation scenarios E1–E9 are defined in `docs/09-verification-plan.md`; usability materials are in `docs/usability/`.

| Folder (planned) | Content |
|---|---|
| `crypto/` | Unit tests of the Crypto Core, known test vectors (RFC 9106, NIST SP 800-38D) |
| `backend/` | Integration tests with Testcontainers (PostgreSQL), state machine and timer tests |
| `simulation/` | Protocol simulation of scenarios E1–E9 with a controllable clock, baseline comparison |
| `e2e/` | Playwright scenarios S1–S8 |
