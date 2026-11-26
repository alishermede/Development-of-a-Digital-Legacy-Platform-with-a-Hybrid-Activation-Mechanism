# DIP-32: distribution and correlation stress experiment

Model 0.2.0; 5 seeds x 2000 worlds = 10000 distinct synthetic worlds, shared across 6 assumption sets and policies. 9600000 paired evaluations.

## Reference: n=3, k=2, interval=7, waiting=7 days

| Assumptions | Method | False release, pooled | False rate across seeds | Non-receipt by 90d | Pooled delivery p95 | Coalition: simulated / exact |
|---|---|---|---|---|---|---|
| errors-lognormal | baseline | 69.26% | 68.30% - 70.15% | 0.00% | 9.68 days | n/a |
| errors-lognormal | hybrid | 0.25% | 0.10% - 0.35% | 2.90% | 17.88 days | 0.00% / 0.00% |
| errors-exponential | baseline | 64.30% | 62.40% - 66.70% | 0.00% | 9.68 days | n/a |
| errors-exponential | hybrid | 0.24% | 0.15% - 0.35% | 2.90% | 17.88 days | 0.00% / 0.00% |
| independent-lognormal | baseline | 69.26% | 68.30% - 70.15% | 0.00% | 9.68 days | n/a |
| independent-lognormal | hybrid | 2.31% | 2.15% - 2.40% | 9.82% | 17.95 days | 3.02% / 2.80% |
| independent-exponential | baseline | 64.30% | 62.40% - 66.70% | 0.00% | 9.68 days | n/a |
| independent-exponential | hybrid | 2.30% | 1.95% - 2.65% | 9.82% | 17.95 days | 3.02% / 2.80% |
| correlated-lognormal | baseline | 69.26% | 68.30% - 70.15% | 0.00% | 9.68 days | n/a |
| correlated-lognormal | hybrid | 3.32% | 2.65% - 3.70% | 11.59% | 17.91 days | 6.87% / 6.40% |
| correlated-exponential | baseline | 64.30% | 62.40% - 66.70% | 0.00% | 9.68 days | n/a |
| correlated-exponential | hybrid | 3.46% | 3.15% - 3.70% | 11.59% | 17.91 days | 6.87% / 6.40% |

## Frontier stability

| Assumptions | Pooled hybrid frontier | Hybrid on frontier in every seed | Hybrid on frontier in at least one seed |
|---|---|---|---|
| errors-lognormal | 26 | 11 | 27 |
| errors-exponential | 28 | 7 | 28 |
| independent-lognormal | 56 | 28 | 58 |
| independent-exponential | 54 | 30 | 61 |
| correlated-lognormal | 74 | 34 | 92 |
| correlated-exponential | 80 | 43 | 96 |

## Interpretation and limits

- Positive dependence can change quorum risk even when every trustee retains the same marginal compromise probability q=0.1. With n=3,k=2 the independent coalition probability is 2.8%; the rho=0.5 mixture gives 6.4%. Neither is an observed real-world rate.
- Both absence distributions have median 10 days before capping at 180 days, but different tails. Comparing paired distributions shows dependence on an assumed absence model; this is not calibration to actual owners.
- No claim of a uniquely optimal configuration: pooled Pareto membership and frequency across five seeds are descriptive. Sparse zero events and conditional p95 can change dominance. All objectives and counts are retained in raw results.
- Pooled Wilson intervals in JSON quantify Monte Carlo error at a fixed policy/scenario. Rows share worlds; they are not independent experiments. Seed min/max ranges are not 95% intervals. No H1 p-value or confirmed H1 is reported.
- The baseline/hybrid subset relation is still built into timing/gates. This study does not validate the backend, cryptography, delivery, annual hazards or authentication.

See ../replication-method.md for the common-mode mixture and remaining work.
