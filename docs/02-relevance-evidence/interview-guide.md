# Interview guide

Task: DIP-4. Author: Aibyn Samat.

The interviews themselves were conducted in Russian. This guide is written in English like the rest of the repository; the Russian wording that was actually sent to respondents is in Appendix A.

## 1. Purpose

The interviews check whether the problem is relevant for ordinary people and domain experts, and confirm or reject the assumptions behind the requirements. We want to know how people currently handle access to their digital data if they suddenly cannot use it themselves, what they fear, whom they trust, and what they would accept.

Assumptions to verify (the IDs are used in interview notes and in the findings table, DIP-6):

| ID | Assumption | Questions | Related requirements |
|----|------------|-----------|----------------------|
| A-01 | People have no working way to pass access to their digital data to close people | 1, 2, 3, 4 | Project purpose (PRP) |
| A-02 | People do not trust services to store their personal data in readable form | 6, 7 | FR-CRY-01, NFR-SEC-01 |
| A-03 | A person can name 2–5 trusted persons and is ready to ask them | 9, 10 | FR-ACT-04 |
| A-04 | A waiting period (7 days by default) before data release is acceptable | 11 | FR-ACT-05 |
| A-05 | "Are you OK?" check-ins by SMS or Telegram are acceptable in frequency and channel | 11 | FR-ACT-01, FR-ACT-02 |
| A-06 | A false activation and a failed activation are judged differently | 12, 13 | FR-ACT-07, FR-ACT-10 |
| A-07 | Some people are willing to pay for such a service | 14 | Outside the requirements |

## 2. Format

An interview is a voice or video call of 20–30 minutes. A messenger conversation counts as an interview when three conditions are met: questions are sent one or two at a time, follow-up questions are asked when an answer is short or unclear, and the note states that the format was a messenger conversation. The full list of questions is never sent at once, otherwise it becomes a questionnaire. Experts (notary, lawyer, IT security specialist) are better interviewed by call.

Rules for the interviewer:

- Do not name or evaluate the product before block D. Before that, ask only about past experience and current habits.
- Do not hint at an answer and do not offer options inside a question. If the person is silent, wait, then ask for an example.
- Do not argue or correct. If an answer is unexpected, ask a follow-up question.
- Do not name prices or periods before the respondent names their own.
- Universal follow-ups: "Tell me more", "Can you give an example?", "How did it go last time?", "Why is that?".
- Record quotes verbatim but keep them short. Write your own conclusions separately.

## 3. Respondent profiles

3–5 interviews are needed, including at least one domain expert if one can be found.

| Profile | Who | Why |
|---------|-----|-----|
| P1 | Adult without technical background, 25–45 | Main target audience |
| P2 | Adult 50+ | Different digital literacy, more often faces inheritance questions |
| P3 | Technically experienced user (student, developer) | Attitude to encryption and password managers |
| P4 | Notary or lawyer | Legal side: inheritance of digital data in Kazakhstan, personal data |
| P5 | Information security specialist | Threats, key-splitting schemes, trust in client-side encryption |

Respondents are identified only by profile code and interview number (I-01…I-05). Names, workplaces and exact age are not recorded.

## 4. Consent text

Read aloud before a call or sent in the messenger before the conversation. A reply "I agree" is needed (written, or verbal with a note). A signature is not required.

> Hello! My name is Aibyn. I am a student working on a project: a web service that helps pass access to digital data to close people if a person does not come online for a long time. I want to understand how people solve such problems today and what matters to them.
>
> The conversation takes about 20–30 minutes. Participation is voluntary: you can skip any question or stop at any moment without giving a reason.
>
> Your name is not used in the project materials; only anonymized answers and conclusions are included. Please do not write names of other people, passwords or account numbers.
>
> Do you agree to take part? Please reply "I agree" and I will send the first questions.

## 5. Interview script

### Introduction (2 minutes)

Thank the respondent, read the consent text, receive the reply, remind that there are no right or wrong answers.

### Block A. Current practices

1. Tell me which important digital data you have: accounts, photos, documents, passwords, money in apps.
2. Where do you keep all of this and how do you protect it? What do you do so as not to lose access?
3. Have you or people you know ever needed access to the data or account of another person who could not provide it? Tell me how it went.

### Block B. Concerns

4. Have you thought about what will happen to your data if you suddenly cannot use it? If yes, what came to mind?
5. In such a situation, what matters more to you: that the right people can get access, or that no outsider gets it? Why?

### Block C. Trust in services

6. Which services for storing passwords, files or notes do you use, and why did you choose them?
7. In your opinion, what happens to your data on the service's side? Who can see it? How do you feel about that?

### Idea description (show after block C)

Read or send without adding any evaluation:

> Imagine a service where a person saves encrypted data or a message in advance for chosen people. The service periodically asks whether everything is fine with the person. If the person does not answer for a long time, their trusted persons must confirm that an event has happened. The key is split between them, so one trusted person is not enough. After the confirmation and a waiting period, the data is opened to the recipient. The service itself cannot read the data.

### Block D. Attitude to the idea and the trustee role

8. What is clear in this description and what is not? What of the things you use today could it be compared to?
9. Whom would you consider as trusted persons? How many such people would you have?
10. If you were asked to be someone's trusted person, what would be acceptable for you to do and what would not?

### Block E. Activation and errors

11. How often and through which channel (SMS, Telegram, email, call) would you be ready to receive the question "Are you OK?" How much time without an answer should pass before someone decides that something has happened, and how long should one wait after that until the data is released?
12. Imagine the data was opened to a recipient although you are alive, for example you were in hospital and did not answer. How would you assess this? What would be acceptable in such a situation and what would not?
13. Now the opposite: you cannot answer, and your trusted persons failed to open the data in time. How would you assess this?

### Block F. Willingness to pay

14. Do you pay for any services for data storage or security now? If such a service existed, under what conditions would you pay for it, what amount would seem reasonable, and would it seem reasonable at all?

### Closing

15. What did I not ask that, in your opinion, should be discussed?

Thank the respondent. Ask whether it is possible to write again if clarifications are needed.

### Additional questions for a notary or lawyer (P4)

- L1. What questions about the digital data of a deceased person (accounts, passwords, correspondence, files) do people bring to you?
- L2. How is access of heirs to such data resolved under the legislation of Kazakhstan today?
- L3. What legal questions does it raise when a service stores data intended for third persons after the owner's death?
- L4. How does the personal data law treat the fact that an owner uploads data about other people?
- L5. What risks do you see for trusted persons who confirm an event that has not happened?
- L6. What should be taken into account so that the owner's will has legal significance?

### Additional questions for an information security specialist (P5)

- S1. What are the main threats in a system where data is encrypted on the user's side and the key is split between several people?
- S2. How do you assess a k-of-n key-splitting scheme for ordinary users: where does it work well and where does it break?
- S3. What should be considered in check-ins and the waiting period to reduce the risk of false activation and abuse?
- S4. Which security checks would you consider sufficient for such a service?

## 6. Note template

Copy to `docs/02-relevance-evidence/interviews/I-0X.md`. "Facts" and "Interpretation" are filled in separately. "Facts" contains only what the respondent said. Conclusions, guesses and evaluations of the interviewer go only into "Interpretation".

```markdown
# I-0X

## Metadata
- Date: DD.MM.YYYY
- Format: call / video call / messenger conversation
- Language: Russian / Kazakh
- Duration: __ minutes
- Respondent profile: P_ (no name, workplace or exact age)
- Consent: received verbally / received in writing (date)
- Audio recording: no / yes, deleted on DD.MM.YYYY

## Facts (what the respondent said)

| Question | Short content of the answer | Verbatim quote (1–2 sentences) |
|----------|-----------------------------|--------------------------------|
| 1 | | |
| 2 | | |
| ... | | |

Situations and examples the respondent described:
-

## Interpretation (my conclusions, not the respondent's words)

- What I think this means:
- What was surprising or contradicts expectations:

## Assumptions

| Assumption ID | Supports / contradicts / unclear | Basis (question, quote) |
|---------------|-----------------------------------|-------------------------|
| A-01 | | |

## New requirements or ideas

-

## What remains unclear

-
```

## 7. Storage and anonymity

- Only anonymized notes are committed to the repository. Screenshots of conversations, audio and contact details of respondents are not added.
- Names, phone numbers, messenger nicknames and organization names are removed from the notes.
- Audio, if any, is deleted after the note is written.
- Before every commit, check that the note contains nothing by which a person can be recognized.
- The findings table (DIP-6) is built only from finished notes; every conclusion refers to an interview ID.

## 8. Check against DIP-4 acceptance criteria

| Criterion | Where it is met |
|-----------|-----------------|
| Questions are neutral, not leading | Section 2 (rules), section 5 |
| Covers current practices, fears, trust in services, trustee role, tolerance to false activation, willingness to pay | Blocks A–F |
| Note template separates facts from interpretation | Section 6 |
| Respondent profiles, 12–15 questions, consent text, note template | Sections 3, 5, 4, 6 |

## Appendix A. Russian wording used in the messenger interviews

Messages were sent one after another; the next message was sent after the reply.

**Message 0 (introduction and consent).**
Здравствуйте, [имя]! Меня зовут Айбын, я студент и делаю проект: сервис, который помогает передать доступ к цифровым данным близким людям на случай, если человек долго не выходит на связь. Хочу понять, как люди сейчас решают такие вопросы.

Это небольшая переписка, примерно на 20-30 минут. Отвечать можно в любое удобное время. Участие добровольное, на любой вопрос можно не отвечать или остановиться в любой момент. В материалах проекта ваше имя не указывается, туда попадут только обезличенные ответы. Пожалуйста, не пишите имена других людей, пароли и номера счетов.

Вы согласны участвовать? Напишите «согласен» или «согласна», и я пришлю первые вопросы.

**Message 1.**
1. Какие важные цифровые данные есть у вас: аккаунты, фотографии, документы, пароли, деньги в приложениях?
2. Где вы всё это храните и как защищаете? Что делаете, чтобы не потерять доступ?

**Message 2.**
3. Бывало ли, что вам или кому-то из знакомых нужно было получить доступ к данным или аккаунту другого человека, который сам не мог этого сделать? Расскажите, как это было.
4. Думали ли вы о том, что будет с вашими данными, если вы внезапно не сможете ими пользоваться? Если да, что приходило в голову?

**Message 3.**
5. Что для вас важнее в такой ситуации: чтобы нужные люди смогли получить доступ или чтобы никто посторонний его не получил? Почему?
6. Какими сервисами для хранения паролей, файлов или заметок вы пользуетесь? Почему выбрали именно их?

**Message 4.**
7. Что, по-вашему, происходит с вашими данными на стороне такого сервиса? Кто может их увидеть? Как вы к этому относитесь?

**Message 5 (idea description and question 8).**
Теперь коротко об идее, над которой я работаю. Представьте сервис, где человек заранее сохраняет зашифрованное сообщение или данные для выбранных людей. Сервис периодически спрашивает, всё ли у человека в порядке. Если он долго не отвечает, его доверенные лица должны подтвердить, что произошло событие. Ключ разделён между ними так, что одного человека недостаточно. После подтверждения и периода ожидания данные открываются получателю. Сам сервис прочитать данные не может.
8. Что в этом описании вам понятно, а что нет? С чем из того, чем вы пользуетесь сейчас, это можно сравнить?

**Message 6.**
9. Кого бы вы рассматривали в качестве доверенных лиц? Сколько таких людей у вас нашлось бы?
10. Если бы вас попросили стать доверенным лицом другого человека, что вам было бы приемлемо делать, а что нет?

**Message 7.**
11. Как часто и по какому каналу (SMS, Telegram, почта, звонок) вы были бы готовы получать вопрос «Вы в порядке?»? Сколько времени без ответа должно пройти, прежде чем кто-то решит, что что-то случилось, и сколько после этого нужно ждать до выдачи данных?

**Message 8.**
12. Представьте: данные открылись получателю, хотя вы живы. Например, вы были в больнице и не отвечали. Как бы вы это оценили? Что в такой ситуации было бы допустимым, а что нет?
13. Теперь наоборот: вы не можете ответить, а доверенным лицам не удалось открыть данные вовремя. Как бы вы это оценили?

**Message 9.**
14. Платите ли вы сейчас за какие-то сервисы для хранения данных или безопасности? Если бы такой сервис существовал, при каких условиях вы стали бы за него платить, какая сумма показалась бы разумной и показалась бы ли вообще?
15. Что я не спросил, но, по вашему мнению, стоило бы обсудить?

**Message 10 (closing).**
Большое спасибо за ответы, они очень помогут! Если появятся уточнения, можно будет написать вам ещё раз?
