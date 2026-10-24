# Pre-defense 1 submission summary

| Item | Value |
|---|---|
| Project | Development of a Digital Legacy Platform with a Hybrid Activation Mechanism Based on Shamir's Secret Sharing |
| Repository | https://github.com/alishermede/Development-of-a-Digital-Legacy-Platform-with-a-Hybrid-Activation-Mechanism |
| Tag | `pre-defense-1` (annotated tag on the merge of pull request #27 into `main`) |
| Date | 24.10.2026 |
| Team | Alisher Medebaev (SE-2414), Aibyn Samat (SE-2415) |
| Supervisor | Tutkyshbayeva Sh.S. |
| Tracker | https://diplom-digital-legacy.youtrack.cloud/projects/DIP |

## Completed work

| # | Component | Where | Result |
|---|---|---|---|
| 1 | Project proposal | `docs/01-proposal.md` | Aim, nine objectives with owners and evidence, scope, users, expected outcomes |
| 2 | Evidence of relevance | `docs/02-relevance-evidence/` | Interview guide, three anonymized interview notes (I-01 to I-03), findings table with verified findings and assumptions |
| 3 | Literature review | `docs/03-literature-review.md` | Critical review with an analysis table, comparison of approaches, research gap and limitations; 20 references |
| 4 | Comparison of existing systems | `docs/04-existing-systems.md` | Five systems compared by ten criteria; cryptographic criteria checked against vendor documents |
| 5 | Technology comparison | `docs/05-technology-comparison.md` | Backend, storage, cryptographic libraries, key storage, API style, timers, notification channels, frontend |
| 6 | Requirements | `docs/06-requirements.md` | 103 requirements with priority, source and acceptance criteria |
| 7 | Architecture | `docs/07-architecture.md`, `diagrams/` | System context, use case (owner and system), component and activation state machine diagrams with editable sources |
| 8 | UX prototype and API examples | `docs/08-prototype.md`, `prototype/` | Eight scenarios with 48 mockup images, an additional AI-assisted interactive prototype, OpenAPI draft with 22 paths |
| 9 | Verification plan | `docs/09-verification-plan.md`, `docs/verification/`, `tests/simulation/` | Metrics M1 to M12, baseline, scenarios E1 to E11, usability plan; standalone design model with recorded results |
| 10 | Project management | `docs/10-project-management.md` | Responsibilities, task register DIP-1 to DIP-27, milestones M1 to M12, 15 risks, dependencies |
| 11 | Supervisor feedback | `docs/11-supervisor-feedback.md` | Round 1 (24.10.2026): five comments, each with a decision and a change |
| — | Legal analysis (DIP-26) | `docs/12-legal-analysis.md` | Norm-to-design table, Kazakhstan hosting decision, consent and transfer gates |
| — | Notification reliability (DIP-27) | `docs/13-notification-reliability.md` | Event, channel and fallback matrix, delivery semantics, retries, fail-closed guards, test cases NR-01 to NR-08 |

Work distribution and reviewers of every task: `docs/10-project-management.md`, section 10.1.1. Every document change went through a pull request reviewed by the other member; the history is in the repository.

## Known limitations

- There is no application code. The only executable artifact is a standalone design model (`tests/simulation/pre-defense-model.cjs`). Its results validate the specified assumptions and guards, not an implementation. Metrics M2, M4, M5, M6, M8, M10 and M11 have not been run.
- Interviews: three respondents, all over 40, and no domain expert (risk R-01). The legal analysis is a requirements analysis of the official texts, not a legal opinion; no lawyer or notary interview has taken place. Civil Code articles 1038 to 1040 are to be rechecked against the official text (risk R-12).
- No hosting provider is contracted. The Kazakhstan storage requirement (NFR-LAW-01, Must) and the consent and transfer gates (NFR-LAW-02, NFR-LAW-04) must be evidenced before any real personal data is processed; demonstrations use synthetic data only. Risk R-06 stays open.
- The additional Figma Make prototype is a UI demonstration made with AI assistance. It is not evidence of encryption, legal compliance or reliable delivery.
- The usability test (section 9.5) is planned for February 2027 and has not been run.
- Some literature sources were read only in part (section 3.7).
- The formatted Word version is synchronized with the Markdown sources by Alisher; the revised aim and the objective table must be carried over.
- Supervisor review of sections 12 and 13 has not taken place; the feedback log contains round 1 only.

## Outstanding tasks

| Task | Responsible | When |
|---|---|---|
| Expert interview (notary or IT security) and update of risk R-06 | Aibyn | November 2026 (M7) |
| Consent notice text, supplier and transfer assessment, hosting decision evidence | Aibyn, reviewer Alisher | Before any real-data pilot |
| Threat model (NFR-SEC-03) and TelegramBots / Spring Boot 4.1 compatibility spike | Alisher | November 2026 (M7) |
| Integration tests M6, M8, M12 against section 13 | Alisher, specification Aibyn | Implementation (M8, M9) |
| Working core: client-side encryption, key splitting, activation state machine | Alisher | December 2026 (M8) |
| Usability test with eight participants | Aibyn | February 2027 (M10) |
| Supervisor feedback, next rounds | Alisher | As received (M6) |
