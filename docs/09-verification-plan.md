## 9.5 Usability evaluation (DIP-22)

*Responsible: Aibyn Samat. This section goes into `docs/09-verification-plan.md` next to Alisher's sections (DIP-21). Adjust the section number to match that file.*

### 9.5.1 Goal and what is measured

The test checks whether ordinary people can set up the platform and act in it without help. It uses the Figma prototype (section 8.1) and measures the usability requirements NFR-USE-01, 02, 03, 05 and 06. The tasks are the eight prototype scenarios, so every task maps to frames that already exist.

| Metric | Target | Source requirement | How it is measured |
|---|---|---|---|
| SUS score | At least 70 | NFR-USE-01 | System Usability Scale [16 in section 3], filled in after all tasks |
| Task success rate | At least 80% of participant-task attempts completed without help | NFR-USE-02 | Observer marks each attempt: success, success with a hint, failure |
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
| Consent text, task cards, note sheet, SUS form in Russian | `docs/09-verification-plan/usability/` |
| Anonymized notes and SUS answers (U-01 to U-08) | `docs/09-verification-plan/usability/results/` |
| Screen recordings | Not stored in the repository |

No names, phone numbers or other personal data are committed.

### 9.5.8 Limits of the test

The prototype has no real encryption, no real Telegram and no real SMS, so it measures understanding and flow and cannot measure the delay of key derivation or the behavior of Telegram SecureStorage on different phones (CON-03). Eight participants cannot confirm the SUS target statistically. The Kazakh interface is not covered in this round; it is tested after the Kazakh texts are reviewed by a native speaker (NFR-L10N-05). A moderated session gives the observer's hints some influence on the time results, which is why hints are recorded and reported separately.
