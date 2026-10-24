# 11. Supervisor Feedback

Task: DIP-24. Responsible: Alisher Medebaev. Reviewer: Aibyn Samat. Supervisor: Tutkyshbayeva Sh.S.

## 11.1 How feedback is recorded

Every comment gets an ID (SF-nn), a decision (accepted, accepted in part, rejected with a reason), the change that follows from it (file and section) and a status. Comments are recorded in writing, in the original wording (section 11.4). Dates of sent materials and of meetings are added to section 11.3 as they happen; nothing is entered here that did not take place.

## 11.2 Feedback log

### Round 1: written comments received on 24.10.2026

| ID | Comment (summary) | Decision | Change | Where | Status |
|---|---|---|---|---|---|
| SF-01 | The aim is overloaded: it contains the whole mechanism. The aim should say what is done and why; the mechanism belongs to the tasks. | Accepted. The aim is rewritten in the proposed form. The mechanism stays in objectives 3–5, the evaluation in objective 7. | New aim in section 1.5; reference to the objectives added | `01-proposal.md` 1.5, 1.6; README opening; Word synchronization assigned to Alisher | Markdown updated; Word pending |
| SF-02 | There is no task for the legal analysis, although the scope includes Kazakhstan legislation and risk R-06 is rated High. Needed: a task "Analyse the requirements of the Law of Kazakhstan on personal data and of inheritance law for the platform". | Accepted. DIP-26 is assigned to Aibyn, reviewer Alisher, for the document deadline 24.10.2026 18:00 UTC+5. Section 12 now contains the official-article mapping, Kazakhstan hosting decision and consent/transfer gates. The expert interview is absent and recorded as a limitation, not fabricated. | Objective 8 added; DIP-26 in the task register, milestone M7, dependency table and graph; R-06 mitigation refers to DIP-26 | `01-proposal.md` 1.6; `10-project-management.md` 10.1–10.4; `12-legal-analysis.md` | Analysis document prepared 24.10; reviewer/expert and deployment checks open |
| SF-03 | The criteria of the verification task are not measurable: "false activation" and "resistance to unauthorized access" are not measured. Needed: simulation scenarios, share of false activations compared with the baseline, tests that *k* − 1 shares do not restore the key, time by NFR-PERF. | Accepted. Metrics M1–M11 existed in the plan but were not visible in the task. They are now stated per metric with a threshold and a method; a randomized comparison with the baseline (M1b) is added. | M1b added with expected values; M2 described as two tests (every combination of *k* − 1 shares; stolen database); M10 and M11 tied to NFR-PERF-01/02; scenario E10 added | `09-verification-plan.md` 9.2, 9.4 | Done |
| SF-04 | Reliability of notifications (NFR-REL-01/02) is mentioned in one phrase, although a missed notification leads to false activation. Make it a separate task or a sub-item. | Accepted both ways: a sub-item in the requirements and a separate task DIP-27 (Aibyn, reviewer Alisher) with a full specification prepared for 24.10.2026 18:00 UTC+5. | FR-NOT-12 (delivery log, definition of "delivered") and FR-NOT-13 (an undelivered check-in is not counted as missed); section 6.7.1; metric M12 and scenario E10; R-09 mitigation | `06-requirements.md` 6.7/6.7.1; `09-verification-plan.md` 9.2/9.4; `13-notification-reliability.md`; `10-project-management.md` 10.3 | Section 13 matrix, retries, all-channel failure guards and standalone model prepared; integration/live tests not run |
| SF-05 | The work must be distributed between the members and every task must have a responsible person, as already done in section 10.1, because the commission will assess each member's contribution. | Accepted. Section 10.1.1 lists every task (DIP-1 to DIP-27) with the responsible member, the reviewer, the milestone, the status and the pull requests. | Task register added | `10-project-management.md` 10.1.1 | Done |

### Changes found while processing the feedback

| Finding | Change |
|---|---|
| A stray row of the notification catalogue broke the table of section 6.7 (FR-NOT-05 to FR-NOT-11 were rendered outside the table). | Row removed. |
| The catalogue said that the trusted persons receive an SMS "if the bot has not been started", FR-NOT-04 says "if Telegram delivery fails (for example, the bot is blocked)". | Catalogue aligned with FR-NOT-04. |

### Deadline follow-up: 24.10.2026

The initially proposed 07.11.2026 document deadline was superseded by the team deadline of 24.10.2026, 18:00 Asia/Qyzylorda. Legal analysis and reliability documents are prepared for review now. Preparation is not supervisor approval. No Word edits, expert interview, live-delivery result or system benchmark is claimed without evidence. Alisher prepares the formatted Word version from these reviewed sources; the revised aim and objective/responsibility table must be synchronized there.

Additional Figma Make prototype supplied by Aibyn is linked in README and section 8.1, with its AI-assisted demonstration scope stated.

### Open after round 1

| Item | Owner | Due |
|---|---|---|
| Review of section 12 and actual supplier/transfer/consent deployment evidence | Aibyn; reviewer Alisher | Before any real-data pilot; document prepared 24.10.2026 |
| M6/M8/M12 integration/live-provider results against section 13 | Alisher; specification Aibyn | Implementation phase; specification/model prepared 24.10.2026 |
| Expert interview (notary or IT security) | Aibyn | November 2026 (M7) |

## 11.3 Communication log

| Date | Event | Result |
|---|---|---|
| 24.10.2026 | Written comments of the supervisor received (two messages) | SF-01 to SF-05 |

## 11.4 Original comments (Russian)

**24.10.2026, message 1.** «Цель перегружена: в неё включено всё описание механизма. Цель должна отвечать на вопрос "что и зачем", а механизм лучше перенести в задачи. Вариант: "Разработать платформу передачи цифрового наследия, которая передаёт зашифрованные данные владельца выбранным получателям только после подтверждённого события, без доверия к провайдеру и с защитой от ложной активации"».

**24.10.2026, message 2.** «Задачи нужно дополнить:
1. Правовой анализ. В scope есть пункт "учёт законодательства РК", но отдельной задачи нет, хотя риск R-06 оценён как High. Нужна задача: "Проанализировать требования Закона РК о персональных данных и наследственного права к платформе".
2. Измеримые критерии в задаче 7. Сейчас "ложная активация" и "устойчивость к несанкционированному доступу" не измеряются. Нужно указать, как именно: сценарии симуляции, доля ложных активаций по сравнению с baseline, тесты "k−1 долей не восстанавливают ключ", время по NFR-PERF.
3. Надёжность уведомлений (NFR-REL-01/02) упоминается в задаче 5 одной фразой, хотя пропущенное уведомление ведёт к ложной активации. Стоит выделить в отдельную задачу или подпункт.
4. Распределение по участникам. Проект командный, и комиссия будет оценивать вклад каждого. Нужно указать ответственного у каждой задачи, как это уже сделано в разделе 10.1».
