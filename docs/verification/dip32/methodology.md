# DIP-32: Monte Carlo sensitivity experiment, first iteration

The original three-scenario sweep below remains the first-iteration specification. A separate model 0.2.0 extension adds alternate absence distributions, dependent compromise and seed replication: see [replication-method.md](replication-method.md). Exclusions below refer to this original sweep unless explicitly updated there.

Prepared 26 November 2026. Responsible: Aibyn Samat. Proposed reviewer: Alisher Medebaev; review has not yet occurred. First-result checkpoint: **5 December 2026**, confirmed by Aibyn. This does not replace all later task dates in the supplied commission table.

## Source and scope

The supplied screenshot assigns Aibyn: DIP-32 + H1 (Monte Carlo over k, n, check-in interval and waiting; false release, non-receipt, collusion probability, dead man's switch comparison and Pareto frontier), DIP-27 live notification tests, DIP-33 Mini App/SecureStorage and DIP-26 + M10 interviews/usability. The screenshot lists later dates for those completed deliverables; Aibyn confirmed that 5 December is the first-result checkpoint. The linked SharePoint workbook was inaccessible through the web reader; no unseen workbook rows are claimed to have been reviewed.

The exact approved wording of H1 was not supplied. We therefore do not invent or declare H1 accepted. The operational question in this iteration is: **under declared synthetic assumptions, how do quorum and timing affect false release, receipt after death and delivery delay compared with a timer-only baseline?**

The old `pre-defense-model.cjs` and its historical report remain intact. This experiment is a separate, more parameterised model, not a replacement for backend validation or a formal proof.

## Reproduce

From the repository root, with Node.js 24 (no packages or network required):

```sh
node --test tests/simulation/dip32/model.test.cjs
node tests/simulation/dip32/run.cjs
```

Inputs: `tests/simulation/dip32/scenarios.json`. Outputs in this directory: summary.md, results.csv, results.json and pareto.svg. Running regenerates these four files. Results include the configuration, seed and SHA-256 digests of model, runner and input file. Version-control those files together. Changes to the method require a model-version change and a new report.

## Modelled episode and assumptions

Each trial is one interruption of an otherwise active owner's check-ins, not a multi-year lifetime. Each synthetic world is evaluated twice: with a living owner returning at the end of an absence, and with a deceased owner who cannot cancel. These are separate conditional populations; they are not combined using an invented mortality rate.

| Driver | First iteration | Evidence / limitation |
|---|---|---|
| Seed / sample | 20261126, 5,000 paired worlds per policy and assumption set | Reproducible pseudo-random sample; no population calibration |
| n, k | Every 2 <= k <= n <= 5 | Project protocol bounds; n=1 and cryptographic k=0 excluded |
| Check-in interval | 3, 7, 14, 30 days | Sensitivity subset of allowed 1-180 days; 30 is the documented registration default |
| Waiting | 1, 7, 14, 30 days | Subset of allowed 1-60 days; default 7 |
| Time to first check after interruption | interval * U(0,1) | Random schedule phase; no phase/absence correlation |
| Escalation | first check + 2 days + 1 day + 1 hour final reply grace | Successful transport only; absolute comparisons rounded to milliseconds to make equality unambiguous |
| Living-owner absence | exp(log(10) + 0.9 * Z), capped at 180 days | Z standard normal via Box-Muller; median before cap 10 days; entirely assumed, not fitted to interviews |
| Owner returns | Immediate cancellation/answer when absence ends | Cancellation wins at the exact release boundary; no delayed reading, coercion or phone hijack in this iteration |
| Honest trustee mistakes | Independent Bernoulli p=0 or 0.05 per trustee per episode | Assumption; independent of availability, compromise and absence |
| Availability | Independent 1 or 0.9 per trustee | Availability during the episode; no later reattempt/recovery model |
| Honest response | Uniform 0-2 days after escalation | Assumption; timestamps drawn once per world |
| Compromise / collusion | Independent Bernoulli q=0 or 0.1 per trustee | q is assumed individual compromise probability, not measured coalition behaviour. k compromised parties can coordinate. Correlated recruitment is not modelled |
| Compromised response | Immediate false confirmation while owner alive; withholding after death | Explicit adverse policy assumption; compromise is distinct from innocent mistake |
| Death observation horizon | 90 days after interruption/death | Non-receipt means no modelled release by this horizon; not permanent loss |
| Transport, server and recipient | Transport succeeds, service available, recipient can decrypt after release | No simulated SMS/Telegram acceptance, recipient key loss, rate limits or cryptography |

The three assumption sets are `honest-perfect`, `independent-errors` and `compromised-trustees`. Baseline and hybrid share the same world, first-check phase, absence and delivery assumptions. The same 5,000 worlds are reused across parameter policies (common random numbers). This aids comparison but means rows are correlated: **do not sum rows as independent owners**. There are 480 hybrid policy/assumption combinations, each paired with baseline, yielding 2.4 million paired evaluations and 960 output rows. There are only 5,000 distinct sampled worlds.

## Release calculations

Baseline releases after the three unanswered delivered check-ins; no quorum or waiting. It is an activation-only timer model: no real Shamir code is configured with k=0.

Hybrid living-owner release requires k votes from compromised trustees or available honest trustees who mistakenly confirm. Earliest release is escalation + kth response delay + waiting. If the owner returns by then, release is cancelled. A coalition's capability alone does not imply a false release: the owner may return first. Hence coalition-threshold rate and collusive false-release count are separate outputs.

For deceased owners, available honest trustees confirm; compromised trustees withhold. If fewer than k confirm, release time is infinite. Non-receipt is release later than 90 days, including infinity. The baseline has no trustee gate, so these particular failure assumptions often give it a receipt advantage. That tradeoff must be reported alongside its higher false-release rate.

**Construction limitation:** hybrid release time cannot precede baseline detection in this model. Thus hybrid-only false releases must be zero by construction. This is a useful implementation consistency check, not independent evidence that the real system satisfies H1. The experiment's useful result is the size and tradeoff of the risks and delays under assumptions, not a claim that an expected subset relation proves security.

## Metrics, uncertainty and Pareto

- False release: released while the synthetic owner is alive and absent / living trials.
- Non-receipt: not released by 90 days / deceased trials.
- Delivery median and p95: days since interruption/death, **conditional on delivery by 90 days**. If no deliveries, null; never replace it with zero. Long waits or non-delivery can improve the conditional delay by excluding bad cases, so read it alongside non-receipt.
- Coalition threshold: at least k compromised trustees / trials. Check against the binomial-tail oracle under the stated independence assumption. This is not an estimate of a real-world conspiracy rate.
- 95% Wilson intervals for proportions are in JSON; CSV preserves raw counts. They express finite Monte Carlo error only. They do not validate assumed distributions, independence, security or human behaviour. Zero events do not establish zero population risk. Median/p95 currently have no bootstrap confidence interval.
- Paired discordance counts expose baseline-only and hybrid-only false releases. No unpaired significance test, claim of statistical H1 confirmation or claim of independent sample size across the sweep is made.
- Pareto minimises three empirical objectives: false release, non-receipt and conditional delivery p95. Compare only within the same assumption set. Baseline duplicates are collapsed to one baseline per interval before dominance testing (baseline has no k/n/waiting policy). Marking in CSV propagates back to paired rows. Equal objectives do not dominate each other. Null p95 is treated as infinity. No single configuration is automatically recommended.
- `pareto.svg` plots only false release versus non-receipt; tooltip includes delay and policy. Rings reflect the full three-objective frontier, so a ring need not be nondominated in the two-dimensional projection. Empirical frontiers require replication/uncertainty analysis before selecting a policy.

## Tests and known exclusions

The Node tests use deterministic boundary cases, a known binomial-tail oracle, invalid configurations, zero availability, k-1/k adversarial parties, exact cancellation/horizon boundaries, reproducible draws and Pareto dominance. The k-1/k test counts confirmations only; **it does not test cryptographic key reconstruction**. An initial exact-time test exposed floating-point drift; event comparisons now use millisecond ticks.

Not included: repeated activity/annual false-alarm hazard, correlated trustee behaviour, full reachability/delivery/retry state machine, notification failure recovery, real cancellation authentication, backend races, encryption/share reconstruction, recipient offline/key loss and device benchmarks. Fail-closed delivery guards remain specified in docs/13 and the historical guard model; this model does not claim to test them.

Before 5 December: review H1 and assumptions with Alisher, add at least one alternate absence distribution and correlated-compromise stress scenario, replicate seeds/uncertainty on Pareto, and prepare a short interpretation tied to the exact requested hypothesis. Preserve failures and limitations in the report. Application/provider evidence will be separate.
