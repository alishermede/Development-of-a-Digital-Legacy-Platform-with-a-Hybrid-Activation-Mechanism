# 8. UX Prototype and API Examples

| Section | Responsible |
|---|---|
| 8.1 Mockup scenarios (DIP-19) | Aibyn Samat |
| 8.2 API examples (DIP-20) | Alisher Medebaev |

## 8.1 Mockup scenarios

Figma prototype: *https://www.figma.com/design/TUcjm1m3MKVUpHNSPEMRR0/Mura?node-id=6-2&t=i2iZQjowyfeHM3Ev-1*

PNG exports: `prototype/mockups/` (file names in the table below).

The prototype covers eight scenarios, two more than the six required by DIP-19. Each scenario follows one actor from start to finish, and each frame names the requirement it shows. The same scenarios become the tasks of the usability test (DIP-22).

Frame sizes: the owner cabinet is drawn at 360 px wide (NFR-USE-07) and the Mini App at 390 × 844 px. The interface language is Russian in the first version of the frames. The Kazakh texts are added after the Russian ones are approved and checked by a native speaker (NFR-L10N-01, NFR-L10N-05).

### S1. Owner registration

Actor: owner, web application. Requirements: FR-OWN-01, FR-CRY-02, FR-CRY-09, NFR-L10N-02.

| Frame | Screen | What it shows |
|---|---|---|
| S1-1 | Language and sign up | Language switch (RU/KZ); fields for email and master password; a one-sentence note that the master password never leaves the device |
| S1-2 | Master password strength | Strength indicator; a plain sentence that the service cannot reset this password |
| S1-3 | Confirm email | "We sent a link" screen; the account stays locked until the link is opened (FR-OWN-01) |
| S1-4 | Recovery key | Key shown once with Print and Copy buttons; the owner must enter two words from it to continue (my proposal for NFR-USE-03; it checks that the key was saved) |
| S1-5 | Welcome | Start of the wizard (S2) |

### S2. Create the first capsule (wizard, steps 1 of 4)

Actor: owner. Requirements: FR-OWN-02, FR-OWN-03, FR-OWN-04, FR-OWN-12, NFR-USE-04, NFR-USE-03.

| Frame | Screen | What it shows |
|---|---|---|
| S2-1 | Wizard progress | Four steps with progress: capsule, trusted persons and *k*, check-in and waiting period, review; a Back button on every step |
| S2-2 | Capsule type | Five content types: credentials, instructions, files and photos, personal messages, business access |
| S2-3 | Capsule editor | Title, text field, optional checklist of instructions (FR-OWN-12), file upload with the 50 MB limit shown (NFR-CAP-01) |
| S2-4 | Recipient and release delay | Recipient picker; field "release delay after the waiting period, 0 to 365 days" with an example (FR-ACT-15) |
| S2-5 | Encryption explained | A short panel at the save button: "The capsule is locked on your device. Only the people you choose can open it." |

### S3. Add trusted persons and set k of n

Actor: owner. Requirements: FR-OWN-06, FR-ACT-04, FR-INV-02, FR-INV-07, FR-OWN-13, NFR-USE-03.

| Frame | Screen | What it shows |
|---|---|---|
| S3-1 | Trusted persons list | Empty list, button to add; counter "from 1 to 5 people" |
| S3-2 | Add a person | Name and phone number; warning that the person needs Telegram and a recommendation to choose more people than *k* (FR-OWN-13) |
| S3-3 | Choose *k* | Slider or stepper for *k*; default 2; sentence that updates with the choice, for example "Any 2 of your 3 people must confirm" |
| S3-4 | Error state | *k* larger than *n* or *n* above 5 rejected with a message |
| S3-5 | Invitation status | Per person: sent, accepted, declined, expired; resend button; banner "Not ready" while fewer than *k* have accepted (FR-INV-07) |
| S3-6 | Optional Telegram invite | Prepared message the owner sends from their own Telegram (FR-INV-03) |

### S4. Check-in and waiting period settings, then review (wizard, steps 3 and 4)

Actor: owner. Requirements: FR-OWN-07, FR-ACT-01, FR-ACT-02, FR-ACT-03, FR-ACT-05, FR-NOT-09, NFR-USE-06.

| Frame | Screen | What it shows |
|---|---|---|
| S4-1 | Check-in settings | Interval (1 to 180 days), time of day, channels (SMS, Telegram), at least one required |
| S4-2 | Total silence | Live line under the interval: "The process starts after about 10 days without an answer" for 7 days; the page shows about 4, 10 and 33 days for 1, 7 and 30 (FR-OWN-07) |
| S4-3 | Waiting period | Field from 1 to 60 days, default 7, with a one-line explanation of what happens in it |
| S4-4 | Review | Summary of capsule, people, *k*, interval and waiting period; the button "Arm" is active only when the configuration is "ready" |
| S4-5 | Dashboard, state ACTIVE | State, last and next check-in, invitation statuses, ready or not ready, all on one screen (FR-OWN-08) |

### S5. Answer the "Are you OK?" check-in

Actor: owner, Telegram and SMS. Requirements: FR-NOT-02, FR-NOT-03, FR-ACT-03, FR-ACT-16.

| Frame | Screen | What it shows |
|---|---|---|
| S5-1 | Telegram message | "Are you OK?" with one button; one tap answers |
| S5-2 | SMS text | Two segments at most (NFR-L10N-03) with the link |
| S5-3 | Link page | Single page with the "I'm OK" button; opening the link alone does nothing (FR-ACT-16) |
| S5-4 | Done | "Thank you, the next check-in is on DD.MM.YYYY" |
| S5-5 | Used or expired link | Clear message in the user's language (FR-NOT-03) |
| S5-6 | Waiting period link | The link shows that it cannot stop a running waiting period and points to the web application (FR-ACT-16) |

### S6. Accept an invitation (trusted person and recipient)

Actor: invited person, Telegram bot and Mini App. Requirements: FR-INV-02, FR-INV-04, FR-INV-05, FR-INV-06, FR-CRY-03a, FR-TRU-01, FR-TRU-06, NFR-USE-05.

| Frame | Screen | What it shows |
|---|---|---|
| S6-1 | SMS | Short explanation, name of the owner, link, mention that Telegram is needed |
| S6-2 | Welcome message | Who added the person, their role, what will be asked, that they cannot see the owner's data, that it is free, buttons Accept, Decline, More (FR-INV-04) |
| S6-3 | Share phone number | Telegram contact sharing button (FR-INV-05) |
| S6-4 | Number mismatch | Rejection when the number differs from the one the owner entered |
| S6-5 | Key created | Mini App makes the key on the phone; one sentence of explanation; no technical terms |
| S6-6 | Accepted | Role, owner name, status "accepted" (FR-TRU-01) |
| S6-7 | Help | At most three short screens: what a key share is, why the server cannot read the data, what happens if the phone is lost (FR-TRU-10) |

The path S6-2, S6-3, S6-5, S6-6 should take at most five taps (NFR-USE-05); count them on the prototype and write the number in the frame notes.

### S7. Trusted person confirms the event

Actor: trusted person, Mini App. Requirements: FR-NOT-04, FR-TRU-03, FR-TRU-04, FR-TRU-05, FR-ACT-08, FR-CRY-06, NFR-USE-05, NFR-USE-06.

| Frame | Screen | What it shows |
|---|---|---|
| S7-1 | Telegram notification | The owner did not answer check-ins; the message has no capsule data (FR-NOT-07) |
| S7-2 | Confirmation screen | Plain explanation of what is being confirmed and the button "Confirm the event" (FR-TRU-03) |
| S7-3 | Are you sure | Second step that states the consequence: the data will be handed over after the waiting period unless the owner cancels (FR-TRU-04) |
| S7-4 | Sent | The screen says the confirmation was sent and shows no count of other confirmations (my choice, to avoid pressure on the other trusted persons) |
| S7-5 | Withdraw | "Withdraw" button available until the waiting period starts (FR-TRU-05) |
| S7-6 | Key check | One-tap key check every 180 days: message with Open, Mini App checks and closes, short confirmation (FR-TRU-07) |

Confirmation takes three steps at most: open, confirm, "Are you sure" (NFR-USE-05).

### S8. Owner cancels during the waiting period, recipient opens the capsule

Two short flows that end the story.

Owner, web application. Requirements: FR-ACT-09, FR-ACT-10, FR-OWN-09, NFR-USE-06.

| Frame | Screen | What it shows |
|---|---|---|
| S8-1 | Email and Telegram alert | The waiting period started, days left, link to the cabinet |
| S8-2 | Dashboard, WAITING PERIOD | State with a countdown; the Cancel button is visible (not visible in RELEASED) |
| S8-3 | Cancel dialog | States the consequence (shares deleted, trusted persons notified) and asks for the master password |
| S8-4 | Back to ACTIVE | Confirmation and the history entry (FR-ACT-13) |

Recipient, Mini App. Requirements: FR-NOT-06, FR-TRU-08, FR-TRU-09, FR-CRY-07, FR-ACT-15.

| Frame | Screen | What it shows |
|---|---|---|
| S8-5 | Notification | Owner name and a link to the bot, no title or content |
| S8-6 | Capsule list | Only the recipient's capsules; a capsule under release delay appears without a title and with its date |
| S8-7 | Open capsule | Decrypted content on the screen |
| S8-8 | Download file | File download after local decryption |

### Checklist before submission

- At least six scenarios have clickable frames; S1 to S8 give eight.
- Every frame has the requirement IDs in its notes.
- The Figma link opens in a private window without an access request.
- PNG exports are in `prototype/mockups/`, named `S1-1.png`, `S2-3.png` and so on.
- The link is added at the top of section 8.1.
- Text contrast is checked (NFR-USE-08) and the owner frames are checked at 360 px (NFR-USE-07).

## 8.2 API examples

*To be added in DIP-20.*
