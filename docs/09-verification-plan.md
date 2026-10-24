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
| M1b | Share of false activations compared with the baseline in a randomized simulation | Proposed system not higher than the baseline in every cell of the table below; 0 with *p* = 0 | Simulation of 1,000 living owners per cell (fixed random seed): absence of 7, 14, 30 or 60 days; each of *n* = 3 trusted persons confirms by mistake with probability *p* = 0, 0.05 or 0.2; *k* = 2; check-in interval 7 days; waiting period 7 days; the owner returns after the absence and cancels if the waiting period is still running. Results are compared with the formula in the note after the table. | FR-ACT-03, 04, 07, 10 |
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
| M12 | Check-ins that were not delivered but counted as missed | 0 transitions to AWAITING CONFIRMATION caused by an undelivered check-in | Integration test and protocol simulation with the SMS and Telegram test doubles failing for 60 days while the owner is alive (scenario E10) | FR-NOT-12, FR-NOT-13, NFR-REL-01, NFR-REL-02 |

M1–M3 and M5 carry the main claim of the project; the others check that the mechanism works reliably and fast enough.

**Expected results of M1b.** With a check-in interval of 7 days the process starts after 10 days of silence (FR-ACT-03). The baseline releases the data on day 10, so it falsely releases in every run with an absence of 14, 30 or 60 days and does not release after 7 days. In the proposed system the earliest release is on day 17 (10 days plus the waiting period), so only absences of 30 and 60 days can end in a false release, and only when at least *k* of the trusted persons confirm by mistake. If mistakes are independent, this probability is 3*p*²(1 − *p*) + *p*³: 0 for *p* = 0, 0.7% for *p* = 0.05 and 10.4% for *p* = 0.2. The simulated shares must agree with these values within the sampling error; a difference means an error in the implementation or in the simulation. The values of *p* and the absence lengths are the project's own assumptions (ASM): they are used to compare the two designs, not to predict real behavior, and the results are reported as a sensitivity analysis.

**M2 (unauthorized access)** is measured by two tests: (1) for every combination of *k* − 1 shares with 2 ≤ *k* ≤ *n* ≤ 5, the key is not reconstructed and the capsule is not decrypted; (2) a full copy of the server database and logs does not allow decryption of any capsule (scenario E6). **M10 and M11** measure the time targets of NFR-PERF-01 and NFR-PERF-02.

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
| E10 | The owner is alive, but SMS and Telegram fail for 60 days (gateway outage, blocked sender) | Check-ins are not delivered and are counted as missed: data released on day 10 (false activation) | Undelivered check-ins are not counted as missed (FR-NOT-13): the process stays ACTIVE, the failure is logged and the owner is warned by email | M12, M1 |

E9 is a limitation shared by both designs. It is reported openly: the proposed system protects the confidentiality of the data, but anybody who controls the owner's check-in channels can delay the release.

**Measurement conditions**

| Item | Condition |
|---|---|
| Test environment | Backend and PostgreSQL in Docker on one machine; notification gateways replaced by test doubles except in the end-to-end tests |
| Clock | Injected clock in the protocol simulation; real time in the end-to-end tests |
| Browsers | Latest stable Chrome and Safari at the time of the measurement; versions are recorded with the results |
| Devices | One mid-range Android phone and one iPhone for NFR-PERF-02 and the Mini App; models are recorded with the results |
| Repetitions | Performance: 10 runs, median reported; M4: 1,000 random runs per (*k*, *n*); scenarios E1–E10: each run once per configuration (the simulation is deterministic); M1b: 1,000 runs per cell with a fixed random seed |
| Data | Synthetic capsules and test accounts only; no real personal data |

Results are reported per metric as target, result and verdict (met, not met, not measurable), in the same format as the usability report (section 9.5). The comparison with the baseline (E1–E10 and M1b) is the main evidence for the aim of the project.

## 9.5 Usability evaluation

### 9.5.1 Goal and what is measured

The test checks whether ordinary people can set up the platform and act in it without help. It uses the Figma prototype (section 8.1) and measures the usability requirements NFR-USE-01, 02, 03, 05 and 06. The tasks are the eight prototype scenarios, so every task maps to frames that already exist.

| Metric | Target | Source requirement | How it is measured |
|---|---|---|---|
| SUS score | At least 70 | NFR-USE-01 | System Usability Scale [16 in section 3], filled in after all tasks |
| Task success rate | At least 80% of participant-task attempts completed without help | PRP (project evaluation target) | Observer marks each attempt: success, success with a hint, failure |
| First capsule with two trusted persons (T2) | At least 80% of participants finish in at most 15 minutes | NFR-USE-02 | Stopwatch from the first tap of S2 to the dashboard in S4-5 |
| Time on task | Targets in the task table | PRP | Stopwatch per task |
| Taps to accept an invitation | At most 5 | NFR-USE-05 | Observer counts taps on S6-2, S6-3, S6-5, S6-6 |
| Steps to confirm an event | At most 3, and no confirmation after a single tap | NFR-USE-05, FR-TRU-04 | Observer counts steps and notes any accidental confirmation |
| Understanding of k of n | At least 4 of 5 participants explain it correctly in their own words | NFR-USE-03 | Comprehension question after the setup (see below) |
| Irreversible actions understood | Every participant who reaches a confirmation dialog can say what will happen | NFR-USE-06 | Question after T7 and T8 |
| Ease per task | Mean of at least 5 on a 7-point scale | PRP | Single Ease Question after each task |

The targets are the project's own and come from the requirements. With five participants the numbers are indicative, and the report will give means and ranges and will not claim statistical significance.

### 9.5.2 Participants

Five owners and three helpers, eight people in total. Owners do T1 to T5 and T8 (owner part). Helpers do T6, T7 and T8 (recipient part). If a participant can play both roles, they do the tasks of both groups and fill in one SUS.

| Group | Number | Profile |
|---|---|---|
| Owners | 5 | Adults who use several online accounts; at least one over 45 and at least one small business owner |
| Helpers (trusted person, recipient) | 3 | Adults who use Telegram daily and have no technical background |

At least three participants should not have taken part in the earlier interviews (DIP-5), so they see the prototype for the first time. Participants speak Russian, and the test runs in Russian because the first version of the prototype is in Russian. One pilot session with a person outside the group checks the script and the timing; its results are not counted.

Participants are recorded as U-01 to U-08. No names, phone numbers or photos are stored in the repository.

### 9.5.3 Tasks

Each task is given as a short situation without naming the buttons. The observer does not explain the interface and gives a hint only after 90 seconds without progress; a hint is recorded and the attempt counts as "success with a hint".

| Task | Situation given to the participant | Prototype scenario | Success criterion | Target time |
|---|---|---|---|---|
| T1 Register | "You decided to try the service. Create an account." | S1 | Account created and recovery key confirmed | 5 min |
| T2 First capsule and trusted persons | "Leave your family documents and instructions for your daughter, and choose two people who will confirm if something happens." | S2, S3, S4 | Capsule saved, two people added, *k* chosen, settings reviewed, "Arm" pressed | 15 min |
| T3 Check-in settings | "Make the service ask you every two weeks at 18:00." | S4 | Interval 14 days and time 18:00 saved | 2 min |
| T4 Check-in answer | "A message arrives asking if you are OK. Answer it." (Telegram, then SMS link) | S5 | Answer sent with one tap in Telegram, and by link plus one button in SMS | 1 min each |
| T5 Check the status | "Find out whether everyone you invited has accepted." | S3-5, S4-5 | Correct statuses read aloud | 1 min |
| T6 Accept an invitation | "Your friend asked you to be a trusted person. Accept." | S6 | Invitation accepted in at most 5 taps | 2 min |
| T7 Confirm an event | "You learn that your friend cannot answer. Confirm the event." | S7 | Confirmed in at most 3 steps, no accidental confirmation | 2 min |
| T8 Cancel and open | Owner: "You are back and the process has started. Stop it." Recipient: "You received access. Open the letter." | S8 | Cancellation done with the master password; capsule opened | 3 min each |

Task order for owners is fixed (T1 to T5, T8) because later tasks depend on earlier ones. For helpers, T6 and T7 are swapped for half of the participants to see whether order changes the result of the confirmation task.

### 9.5.4 Comprehension questions

Asked after the tasks, before the SUS. The observer notes the answer word for word and marks it correct, partly correct or wrong against the reference answer.

| Question | Reference answer | Requirement |
|---|---|---|
| "In your own words, what does '2 of 3' mean here?" | Two of the three chosen people must confirm before anything is passed on; one person cannot do it alone | NFR-USE-03 |
| "Can the service read what you stored?" | No, it is locked on the owner's device | NFR-SEC-01 |
| "What happens when you press 'Confirm the event'?" | Nothing is handed over at once; a waiting period starts after enough confirmations and the owner can stop it | FR-TRU-04 |
| "What happens if you lose your phone?" | The key on it is lost; the owner must be told and the shares are recreated | FR-TRU-10 |
| "What do you do if you forget the master password?" | Use the recovery key | FR-CRY-09 |

### 9.5.5 Procedure

1. Welcome and consent (3 min). The consent text states that the prototype is tested and not the participant, that the session is recorded on screen only if the participant agrees, and that data is anonymized.
2. Short background questions: age group, how often they use Telegram, whether they have stored passwords for relatives (3 min).
3. Tasks with thinking aloud (about 25 min for owners, 12 min for helpers). The observer records time, taps or steps, success, hints, errors and quotes on the note sheet.
4. Single Ease Question after each task.
5. Comprehension questions (5 min).
6. SUS questionnaire (3 min).
7. Closing question: "What would worry you before trusting the service with real data?" (3 min).

The session takes about 45 minutes for owners and about 25 minutes for helpers. Owner tasks are run on a laptop at desktop width and on a phone at 360 px if time allows; Telegram and Mini App tasks run on the participant's own phone through the prototype link, so the phone frame is not needed.

### 9.5.6 Scoring and analysis

SUS is scored in the usual way: for odd items subtract 1 from the answer, for even items subtract the answer from 5, add all ten values and multiply by 2.5. The result is between 0 and 100. SUS is reported for owners, helpers and all participants.

Problems found are listed with a severity: critical (the participant cannot finish), major (finishes with a hint or after a long detour), minor (hesitates or complains). Every critical and major problem goes into the backlog with a link to the frame where it appeared. The report states, for each metric, the target, the result and a verdict (met, not met, not testable with this prototype).

### 9.5.7 Materials and data handling

| Material | Location |
|---|---|
| Consent text, task cards, note sheet, SUS form in Russian | `docs/usability/` |
| Anonymized notes and SUS answers (U-01 to U-08) | `docs/usability/results/` |
| Screen recordings | Not stored in the repository |

No names, phone numbers or other personal data are committed.

### 9.5.8 Limits of the test

The prototype has no real encryption, no real Telegram and no real SMS, so it measures understanding and flow and cannot measure the delay of key derivation or the behavior of Telegram SecureStorage on different phones (CON-03). Eight participants cannot confirm the SUS target statistically. The Kazakh interface is not covered in this round; it is tested after the Kazakh texts are reviewed by a native speaker (NFR-L10N-05). A moderated session gives the observer's hints some influence on the time results, which is why hints are recorded and reported separately.
