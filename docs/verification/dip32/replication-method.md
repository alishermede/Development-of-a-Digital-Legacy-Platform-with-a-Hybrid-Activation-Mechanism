# DIP-32: replication and dependent-compromise extension

Prepared 26 November 2026. Model version 0.2.0. This extends the first-result experiment; it does not establish the exact, still unconfirmed wording or truth of H1.

## Reproduce

From repository root, Node.js 24; no packages/network needed:

```sh
node --test tests/simulation/dip32/model.test.cjs
node tests/simulation/dip32/replicate.cjs
```

Inputs: `tests/simulation/dip32/replication.json`. Outputs: `replication/results.json` (pooled counts, Wilson intervals, delays, all seed values and frontier frequencies), `replication/per-seed.csv` (all individual-seed rows) and `replication/summary.md`. SHA-256 digests of model, runner and configuration are embedded. The historical pre-defense model/report remain untouched.

Five distinct seeds (20261126-20261130), each with 2,000 synthetic worlds, are evaluated with the existing 160 hybrid policies across six assumption sets. Total: **9.6 million paired evaluations, 10,000 distinct worlds**, 9,600 paired per-seed rows (including duplicated baselines) and 984 unique pooled policy/scenario rows. Sharing worlds does not multiply the number of independent participants. Real people are not being sampled.

## Two absence distributions

1. Original lognormal: median 10 days, log-scale standard deviation 0.9, capped at 180 days.
2. Exponential: scale 10 / log(2) days, hence median 10 days, capped at 180 days.

Both are hypothetical sensitivity assumptions. Equal medians isolate a tail/shape difference rather than holding the means equal. They do not represent survey estimates or an upper/lower bound on reality. The exponential draw is independent of the lognormal draw, while both variants reuse first-check phase and trustee draws in each synthetic world. Death experiments are unaffected by living-owner absence; this is checked in a deterministic test.

## Dependent compromise with fixed marginal probability

Each episode uses a mixture switch B ~ Bernoulli(rho). If B=0, each trustee is compromised independently with probability q. If B=1, one common draw compromises either all trustees (probability q) or none. The first iteration's independent scenario has rho=0; the stress scenario uses rho=0.5. Every individual trustee still has marginal compromise probability q=0.1. For 0<q<1, pairwise Bernoulli correlation is rho. This is a stylised common-cause model, not a measured social-conspiracy process.

For 2 <= k <= n, the exact probability of reaching the compromised quorum is:

`rho*q + (1-rho)*P(Binomial(n,q) >= k)`.

For n=3,k=2,q=0.1: independence gives 0.028; rho=0.5 gives 0.064. This exact oracle tests the coalition calculation. Larger n or k cannot be assumed to remove common-cause risk: the all-compromised branch alone contributes rho*q. Independent innocent mistakes and honest availability remain the same as the first experiment; correlations among those are not simulated.

The adversarial policy is unchanged: compromised parties immediately falsely confirm for a living owner and withhold for a deceased owner. A common coalition may be stopped by a returning owner's assumed immediate cancellation before release. Coalition capability, false release and non-receipt remain distinct metrics. These assumptions are intentionally visible and should be reviewed with Alisher.

## Replication and Pareto interpretation

- Baseline and hybrid share each world and detection schedule. Baseline duplicates appear in the per-seed file solely to identify their paired policy; contribute once per seed/scenario/interval to pooling and dominance.
- Each fixed policy/scenario has 10,000 pooled Bernoulli observations across distinct seeds. Wilson intervals reflect finite simulation uncertainty only. Seed min/max ranges in the report are descriptive ranges, not confidence intervals, and not uncertainty about the assumptions.
- Pooled p95 is recomputed from all delivered observations, not averaged from per-seed percentiles. p95 remains conditional on receipt by day 90; missing deliveries are captured separately by non-receipt. Null means no deliveries.
- Each seed gets its own empirical frontier; `frontierFrequency` is the fraction of five seed runs on that frontier. `pooledPareto` uses pooled rates/p95. These are sample-dependent descriptions, not probabilities that a policy is truly optimal.
- No cross-assumption dominance, preferred production policy, statistical H1 acceptance or inference of human behaviour is made. Read `methodology.md` for the original state/timing exclusions. The subset relation between baseline and hybrid remains constructed into the model.

## What remains for 5 December

Confirm the actual H1 and review the distributions/behaviour assumptions; interpret sensitivity rather than quote a single risk percentage; consider delayed owner responses, correlated mistakes/availability and alternate horizons. Add confidence-aware policy selection criteria if selecting a configuration is required. Live Telegram/SMS measurements, Mini App/Android checks, interviews and implementation-security tests remain separate tasks and have not been executed by this experiment.
