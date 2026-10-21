# Evidence of relevance

Task: DIP-6. Status: draft based on three interviews (I-01…I-03).

## 1. What was done

Three interviews were conducted in a messenger following the script in [interview-guide.md](interview-guide.md). Notes: [I-01](interviews/I-01.md), [I-02](interviews/I-02.md), [I-03](interviews/I-03.md). Interviews were in Russian; quotes in the notes are given in the original with an English translation.

## 2. Limitations of the sample

- 3 respondents, all adults 40+, living in Kazakhstan.
- No domain expert (lawyer, notary, IT security specialist). An expert interview remains planned.
- Messenger format: answers are short, follow-up questions were rarely asked, pairs of questions were sent together (12 and 13, 14 and 15).
- One value (the amount in I-01) has no payment period; I-03 has no amount and no answer about current payments.
- Status rule: a finding is marked verified if at least two interviews support it, otherwise assumption. Because the sample is small, verified means "preliminarily confirmed".

## 3. Findings

Requirement IDs refer to [06-requirements.md](../06-requirements.md).

| ID | Finding | Evidence | Status | Requirements |
|----|---------|----------|--------|--------------|
| F-01 | Respondents faced a situation where access to another person's data was needed and the person could not give it (hospital, death). Without preparation it takes time and effort | I-01 (Q3), I-02 (Q3), I-03 (Q3) | verified | FR-ACT-01…13, FR-CRY-04…07 |
| F-02 | Without a service people keep data on the phone and either memorize passwords or write them on paper. There is no systematic way to pass access | I-01 (Q2, Q6), I-02 (Q2, Q6) | verified | FR-ACT-01…13, FR-CRY-04…07 |
| F-03 | Respondents named 2–4 closest people as trusted persons (wife and children, children, daughter and sister). This fits 1 ≤ n ≤ 5 and the default k = 2 | I-01 (Q9), I-02 (Q9), I-03 (Q9) | verified | FR-ACT-04, FR-CRY-04 |
| F-04 | A trusted person is ready to confirm the event and pass the key, but not to take responsibility for serious decisions, keep complex passwords or go through someone's archives. Note that FR-CRY-10 asks trusted persons to periodically open the Mini App to check their key | I-02 (Q10), I-03 (Q10) | verified | FR-ACT-08, FR-CRY-06, FR-CRY-10, FR-INV-01 |
| F-05 | SMS is acceptable for check-ins for every respondent. Telegram is named by one, WhatsApp by one. One respondent rules out email because she may not open it for a week | SMS: I-01, I-02, I-03. Telegram: I-03. WhatsApp: I-02. Email rejected: I-03 | verified for SMS, assumption for Telegram and WhatsApp | FR-ACT-02, FR-ACT-09, FR-INV-02 |
| F-06 | The desired check-in frequency differs: weekly (I-02), monthly (I-03). The configurable range of 1–180 days with a 30-day default covers both | I-02 (Q11), I-03 (Q11) | verified (the interval must be configurable) | FR-ACT-01 |
| F-07 | Time without an answer before an alarm: 2 days (I-01), about 7 days (I-02), about 10 days (I-03). Pause after confirmation: 2 days, about a month, about 5 days. The spread is large. FR-ACT-05 (1–60 days, default 7) covers all three; FR-ACT-03 fixes the escalation at day 0, 2 and 3 and is not configurable | I-01 (Q11), I-02 (Q11), I-03 (Q11) | verified that the waiting period must be configurable. The default of 7 days remains an assumption | FR-ACT-03, FR-ACT-05 |
| F-08 | Respondents want data opened only in part: the necessary data, or in stages | I-01 (Q12), I-02 (Q5), I-03 (Q12) | verified | No matching requirement. Proposed: owner can split data into capsules with different recipients and release conditions (FR-OWN, DIP-15) |
| F-09 | A false activation is seen as unpleasant but not critical. A failed activation is called "the worst" by I-03. I-02 calls both bad | I-02 (Q12, Q13), I-03 (Q12, Q13) | assumption | FR-ACT-07, FR-ACT-10, NFR-REL-01, NFR-REL-02 |
| F-10 | The ability to cancel the release during the waiting period is wanted | I-02 (Q12) | assumption | FR-ACT-10 |
| F-11 | Two respondents are uneasy about who can see data stored by a service, or consider storage unsafe. One respondent who uses a password manager and 2FA trusts strong encryption | I-01 (Q7), I-02 (Q7), I-03 (Q7) | assumption | FR-CRY-01, FR-CRY-02, NFR-SEC-01, NFR-SEC-02 |
| F-12 | Respondents pay little or nothing for similar services. The expected price is about 1000 KZT (period not stated) or 500–1000 KZT per month, provided the service is simple, secure and anonymous | I-01 (Q14), I-02 (Q14) | verified (preliminarily) | Outside the requirements (business model) |
| F-13 | For users without a technical background, encryption and key splitting are hard to understand. A clear instruction is needed | I-02 (Q8, Q15) | assumption | FR-INV-04, NFR-USE (DIP-15) |
| F-14 | An existing solution is in real use: one respondent uses Google "Inactive Account Manager". Others do not know of such services | I-03 (Q3, Q8), I-01 (Q7), I-02 (Q6) | assumption | DIP-10 (existing systems comparison) |
| F-15 | One respondent suggests a separate code for force-majeure situations. The meaning is unclear | I-01 (Q13) | assumption | To clarify, possibly related to FR-ACT-10 |
| F-16 | Trusted persons and recipients take part only through Telegram (bot and Mini App). Respondents named SMS most often, and one named WhatsApp rather than Telegram. A relative without Telegram could not take part | I-01 (Q11), I-02 (Q11), I-03 (Q11) | assumption | FR-INV-01, FR-INV-02, CON-04 |

## 4. Status of assumptions from the interview guide

| ID | Assumption | Result |
|----|------------|--------|
| A-01 | No working way to pass access | Supported by I-01, I-02. I-03 found her own way after a painful experience |
| A-02 | People do not trust services to store data | Partly: I-01 and I-02 are concerned, I-03 trusts strong protection |
| A-03 | 2–5 trusted persons | Supported by all three |
| A-04 | A 7-day waiting period is acceptable | Not confirmed as a single value: 2, about 5 and about 30 days were named. 7 days is inside the configurable range of FR-ACT-05 |
| A-05 | SMS and Telegram are acceptable | SMS confirmed, Telegram by one respondent, WhatsApp appeared as a new channel |
| A-06 | False and failed activation are judged differently | Supported only by I-03 |
| A-07 | Some people are willing to pay | Supported by I-01, I-02 at the level of 500–1000 KZT |

## 5. Impact on requirements and other documents

These are points for discussion with Alisher and the supervisor, not changes already made.

- **FR-ACT-03 (escalation).** The fixed schedule (day 0, 2, 3) is shorter than what two respondents describe (about 7 and about 10 days without an answer). Consider making it configurable or confirm that the check-in interval already covers it.
- **Staged or partial release (F-08).** All three respondents want it, and there is no requirement for it. It could be covered by separate capsules with their own recipients and delays (FR-OWN, DIP-15).
- **Dependence on Telegram (F-16, CON-04).** Check whether the trusted persons named by respondents would have Telegram. SMS fallback and n > k are already suggested in CON-04.
- **FR-CRY-10.** Periodic key checks add a duty for trusted persons, while respondents accept only minimal tasks. Keep the check simple and rare.
- **Usability (F-13).** NFR-USE in DIP-15 should require plain-language explanations of encryption and key splitting and a step-by-step instruction.
- **WhatsApp (F-05).** Check as an additional channel in DIP-13.
- **Existing systems (F-14).** Google "Inactive Account Manager" is used in practice, so it is a real alternative in DIP-10.
- **Risk register (DIP-23).** Add the risk of a small, non-representative sample.
- **Requirements with source ASM.** FR-CRY-08, FR-CRY-09, FR-ACT-12, FR-ACT-13, FR-INV-06, NFR-SEC-06, NFR-REL-01, NFR-REL-02, NFR-PERF-01, NFR-PERF-02 and NFR-CAP-01 are not covered by the interviews and remain assumptions. NFR-SEC-06 (2FA) is only indirectly supported, since I-03 uses 2FA herself.

## 6. Next steps

- An interview with a notary or an IT security specialist, using the additional questions of the interview guide.
- 1–2 more respondents of a younger age group (P1, P3).
