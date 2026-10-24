# Pre-defense Design-Model Results

Prepared: 24.10.2026. Tasks DIP-21 and DIP-27. Command: `node tests/simulation/pre-defense-model.cjs`.

**Evidence level:** standalone specification model. No Spring Boot/Quartz, real provider, cryptographic library or device benchmark was executed. A model pass is not a production/security test pass.

## M1b: paired sensitivity experiment

LCG seed: 20261024; 1,000 paired living-owner runs per cell; n=3, k=2; transport succeeds; independent mistaken trustee confirmations with probability p. Absence lengths are fixed conditional cells, not measured population frequencies. Owner returns/cancels at the end of the absence. Day-level abstraction rounds away the final one-hour reply grace.

| Absence (days) | p (ASM) | Baseline false / 1000 | Hybrid false / 1000 | Baseline % | Hybrid % | Hybrid Wilson 95% interval | Analytical hybrid % |
|---|---|---|---|---|---|---|---|
| 7 | 0 | 0 | 0 | 0.0 | 0.0 | 0.00–0.38% | 0.000 |
| 7 | 0.05 | 0 | 0 | 0.0 | 0.0 | 0.00–0.38% | 0.000 |
| 7 | 0.2 | 0 | 0 | 0.0 | 0.0 | 0.00–0.38% | 0.000 |
| 14 | 0 | 1000 | 0 | 100.0 | 0.0 | 0.00–0.38% | 0.000 |
| 14 | 0.05 | 1000 | 0 | 100.0 | 0.0 | 0.00–0.38% | 0.000 |
| 14 | 0.2 | 1000 | 0 | 100.0 | 0.0 | 0.00–0.38% | 0.000 |
| 30 | 0 | 1000 | 0 | 100.0 | 0.0 | 0.00–0.38% | 0.000 |
| 30 | 0.05 | 1000 | 7 | 100.0 | 0.7 | 0.34–1.44% | 0.725 |
| 30 | 0.2 | 1000 | 91 | 100.0 | 9.1 | 7.47–11.04% | 10.400 |
| 60 | 0 | 1000 | 0 | 100.0 | 0.0 | 0.00–0.38% | 0.000 |
| 60 | 0.05 | 1000 | 5 | 100.0 | 0.5 | 0.21–1.17% | 0.725 |
| 60 | 0.2 | 1000 | 112 | 100.0 | 11.2 | 9.39–13.31% | 10.400 |

The paired model never exceeds the baseline and has zero false releases with p=0. A nonzero p can cause false release while the owner is alive; these numbers do not establish a real-world false-activation rate. Finite-sample deviation from the analytical binomial probability is expected, not automatically an implementation defect.

## Notification guard model checks

- PASS (model): NR-02: 60 days of undelivered check-ins do not escalate
- PASS (model): NR-03: total owner-channel failure blocks old waiting-period deadline
- PASS (model): NR-04: serializing/reloading model preserves fault and deadline
- PASS (model): NR-07: cancellation rejects a stale release job

The reload check serializes a JavaScript object only. It does not test database transactions, Quartz persistence, callback authentication, timing within one hour, rate limits, live deliverability or restart behavior of the backend.

## Unexecuted implementation evidence

| Metric / evidence | Status |
|---|---|
| M2 / M4: every k-1/k subset and cryptographic reconstruction | Not run; implementation/library harness required |
| M5: canary scan of database, logs and decrypted HTTP payloads | Not run; running application required |
| M6 / M8 / M12 integration and provider tests | Not run; standalone guard model only |
| M10 / M11: 10 MB encryption/sharing and Argon2id, median of 10 runs | Not run; real browser/device and recorded versions required |
| Expert legal interview | Not conducted in the supplied evidence |
