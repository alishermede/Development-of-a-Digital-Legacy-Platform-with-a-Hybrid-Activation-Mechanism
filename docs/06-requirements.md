# 6. Requirements Specification

**Priority:** MoSCoW (Must / Should / Could / Won't)

**Source codes:** PRP — project proposal; LIT — literature review; LAW — legislation of the Republic of Kazakhstan; ASM — assumption, to be confirmed by interviews (DIP-5, DIP-6); INT — interviews, see [02-relevance-evidence](02-relevance-evidence/README.md) (finding IDs F-xx)

**Terms**

- **Capsule** — an encrypted set of data (credentials, instructions, files, messages) intended for one or more recipients.
- **Capsule key (CK)** — a random 256-bit key that encrypts one capsule.
- **Share** — one of *n* parts of the capsule key created with Shamir's Secret Sharing; any *k* shares reconstruct the key. When *k* = 1, the key is not split and each trusted person receives an encrypted copy of it.
- **Mini App** — a web application opened inside Telegram; used by trusted persons and recipients, who have no account in the system.
- **SecureStorage** — Telegram Mini App storage backed by the phone's Keychain (iOS) or Keystore (Android).

| Section | Responsible |
|---|---|
| 6.1 Cryptographic core, 6.2 Hybrid activation, 6.3 Invitation and identity, 6.4 Security, reliability and performance NFRs, 6.9 Constraints | Alisher Medebaev (DIP-14) |
| 6.5 Owner cabinet, 6.6 Trusted person and recipient interface (bot and Mini App), 6.7 Notifications, 6.8 Usability and localization NFRs | Aibyn Samat (DIP-15) |

## 6.1 Functional requirements — Cryptographic core (FR-CRY)

| ID | Requirement | Priority | Source | Acceptance criteria |
|---|---|---|---|---|
| FR-CRY-01 | The system shall encrypt capsule content in the owner's browser with AES-256-GCM using a random 256-bit capsule key before upload. | Must | PRP, LIT | Network traffic and the database contain only ciphertext; modified ciphertext fails to decrypt (authentication tag check). |
| FR-CRY-02 | The system shall derive the owner's key-encryption key from the master password with Argon2id in the browser. The master password shall never be sent to the server. | Must | PRP, LIT | Argon2id parameters are documented; no request contains the master password or a value from which it can be directly obtained. |
| FR-CRY-03 | The system shall generate an X25519 key pair for the owner in the browser; the owner's private key shall be stored on the server only encrypted with the key from FR-CRY-02. | Must | LIT | The stored private key cannot be used without the master password; the database contains no plaintext private keys. |
| FR-CRY-03a | The system shall generate an X25519 key pair for each trusted person and recipient inside the Telegram Mini App on their device and store the private key only in Telegram SecureStorage. Only the public key is sent to the server. | Must | PRP | The private key never appears in network traffic, in the database or in Telegram CloudStorage; the server holds only the public key. |
| FR-CRY-04 | If *k* ≥ 2, the system shall split the capsule key into *n* shares with threshold *k* (2 ≤ *k* ≤ *n* ≤ 5) using Shamir's Secret Sharing from an audited library. If *k* = 1, the key shall not be split; each of the *n* trusted persons receives the capsule key encrypted for them (FR-CRY-05). | Must | PRP, LIT | For *k* ≥ 2, every combination of *k* shares reconstructs the key and no combination of *k*−1 shares produces it; for *k* = 1, any single trusted person's copy restores the key. |
| FR-CRY-05 | The system shall encrypt each share (or, for *k* = 1, each copy of the capsule key) with the public key of the corresponding trusted person before it leaves the owner's browser. | Must | PRP | The server stores only encrypted shares; a share can be decrypted only with the private key of its trusted person. |
| FR-CRY-06 | When confirming the event, the trusted person's Mini App shall decrypt their share with the private key from SecureStorage and re-encrypt it with each recipient's public key. | Must | PRP | The submitted share is readable only by the recipient; the server, Telegram and other trusted persons cannot decrypt it. |
| FR-CRY-07 | After release, the recipient's Mini App shall reconstruct the capsule key from *k* shares and decrypt the capsule locally. | Must | PRP | The recipient sees the original content; decryption happens without sending the key to the server. |
| FR-CRY-08 | The system shall re-split the capsule key and invalidate old shares when the owner changes the trusted persons, *k* or *n*. | Must | ASM | Old shares cannot reconstruct the new key; removed trusted persons lose the ability to participate. |
| FR-CRY-09 | The system shall generate a recovery key at registration that lets the owner regain access if the master password is forgotten. It is shown once and can be printed. | Should | ASM | An owner who lost the password restores access with the recovery key; without the password and the recovery key, access is impossible. |
| FR-CRY-10 | Once every 180 days the system shall check that each trusted person's and recipient's private key is still present in SecureStorage. The check requires one tap: the bot sends a button, the Mini App verifies the key automatically and closes. If the person opened the Mini App during this period, the check is counted automatically. A reminder is sent only if there is no reaction within 7 days. If the key is missing and cannot be restored, the owner is notified and asked to re-create the shares (FR-CRY-08). | Must | PRP, INT (F-04) | No more than one check request per 180 days per person; the check needs no input other than one tap; removing the key from SecureStorage is detected at the next check and the owner is notified. |

## 6.2 Functional requirements — Hybrid activation (FR-ACT)

| ID | Requirement | Priority | Source | Acceptance criteria |
|---|---|---|---|---|
| FR-ACT-01 | The owner shall configure the check-in interval from 1 to 180 days (default: 30 days). | Must | PRP, INT (F-06) | Values outside the range are rejected; the next check-in is scheduled according to the saved interval. |
| FR-ACT-02 | Check-ins shall be sent via SMS and Telegram only. The owner shall configure at least one of these channels. | Must | PRP, INT (F-05) | No check-in is sent by email; saving settings without SMS or Telegram is rejected. |
| FR-ACT-03 | If a scheduled check-in is missed, the system shall send a repeated check-in after 2 days, and if that is missed, a final check-in after 1 more day. If the final check-in is missed, the activation process starts. The escalation schedule is fixed; the total time of silence before the process starts is the check-in interval plus 3 days (e.g. 7 + 3 = 10 days), and the owner's settings screen shall show this total. | Must | PRP, INT (F-07) | Given no responses, exactly 3 check-ins are sent (day 0, day 2, day 3) and the state changes to AWAITING CONFIRMATION after the third is missed; a response at any step returns the state to ACTIVE; the settings screen shows the total silence time. |
| FR-ACT-04 | The owner shall choose from 1 to 5 trusted persons (*n*) and the number of confirmations required (*k*), where 1 ≤ *k* ≤ *n*. The default value of *k* is 2 (or 1 if only one trusted person is added). | Must | PRP, INT (F-03) | *n* > 5 or *k* > *n* is rejected; a new configuration with two or more trusted persons proposes *k* = 2; the activation requires exactly *k* distinct confirmations. |
| FR-ACT-05 | The owner shall configure the waiting period from 1 to 60 days (default: 7 days). | Must | PRP, INT (F-07) | Values outside the range are rejected; new owners get 7 days by default. |
| FR-ACT-06 | The system shall implement activation as a state machine with the states ACTIVE, CHECK-IN PENDING, AWAITING CONFIRMATION, WAITING PERIOD, RELEASED, CANCELLED, allowing only defined transitions. | Must | PRP | Every invalid transition is rejected; every transition is recorded in the audit log with time and cause. |
| FR-ACT-07 | Missed check-ins shall only start the process (notification of trusted persons) and shall never release data by themselves. | Must | PRP, INT (F-09) | Given all check-ins missed and 0 confirmations, no capsule is released after any amount of time. |
| FR-ACT-08 | The process shall move to WAITING PERIOD only after confirmations from *k* different trusted persons. | Must | PRP | With *k*−1 confirmations the state does not change; repeated confirmation by the same person is counted once. |
| FR-ACT-09 | During the waiting period, the system shall notify the owner on all configured channels (SMS, Telegram, email) at its start and every 24 hours. | Must | PRP | Notification log shows delivery attempts on every channel at the start and at least once per day. |
| FR-ACT-10 | The owner shall be able to cancel the process at any state before RELEASED by entering the master password. Cancellation returns the process to ACTIVE, deletes submitted shares and notifies trusted persons. | Must | PRP, F-10 | After cancellation, no submitted shares remain on the server and recipients get no access. |
| FR-ACT-11 | When the waiting period ends without cancellation, the system shall release the submitted shares of each capsule to its recipients after the capsule's release delay (FR-ACT-15) and notify them. | Must | PRP | Recipients receive access only after the waiting period and the capsule's release delay have fully expired. |
| FR-ACT-12 | A trusted person shall be able to withdraw their confirmation before the waiting period starts. | Should | ASM | After withdrawal, the confirmation count decreases and the state is recalculated. |
| FR-ACT-13 | The owner shall see a history of all activation events (check-ins, confirmations, cancellations, notifications). | Should | ASM | All events from FR-ACT-06 are visible to the owner in chronological order. |
| FR-ACT-14 | The system shall run one activation process per owner. Check-ins, trusted persons, *k* and the waiting period are defined per owner; recipients are defined per capsule. | Must | PRP | An owner with several capsules has exactly one activation state; confirmations from trusted persons apply to all capsules of this owner. |
| FR-ACT-15 | The owner shall be able to set an additional release delay for each capsule from 0 to 365 days (default: 0) that starts when the waiting period ends. | Should | INT (F-08) | A capsule with a 30-day delay becomes available to its recipients 30 days after the waiting period ends; capsules with delay 0 are released immediately. |
| FR-ACT-16 | A check-in sent by SMS shall contain a link that opens without login. The link carries a single-use random token (at least 128 bits) bound to this check-in and valid until the next escalation step. The link opens a page with an "I'm OK" button; the answer is counted only when the button is pressed. The link works only during the check-in stage and cannot stop the waiting period (FR-ACT-10). | Must | PRP, INT (F-05) | Opening the link alone (e.g. by a link preview) does not count as an answer; a used or expired token is rejected; during WAITING PERIOD the link does not change the state. |

## 6.3 Functional requirements — Invitation and identity of trusted persons and recipients (FR-INV)

| ID | Requirement | Priority | Source | Acceptance criteria |
|---|---|---|---|---|
| FR-INV-01 | Trusted persons and recipients shall take part without registration in the system, using only the Telegram bot and Mini App. | Must | PRP | No account, password or e-mail is required from a trusted person or recipient. |
| FR-INV-02 | When the owner saves a trusted person or recipient (name and phone number), the system shall send them an SMS with a short explanation and a single-use invitation link to the Telegram bot. | Must | PRP | The SMS is sent within 1 minute after saving; the link opens the bot with the invitation token. |
| FR-INV-03 | The owner shall be able to additionally send the invitation from their own Telegram account as a prepared message with a button that opens the bot. | Should | PRP | The prepared message opens in Telegram with the text and button already filled in; the owner only chooses the contact. |
| FR-INV-04 | After the invited person presses Start, the bot shall send a welcome message explaining who added them, their role, what will be required, that they cannot see the owner's data, that participation is free, and how to decline. | Must | PRP | The welcome message contains all listed points and the buttons Accept / Decline / More. |
| FR-INV-05 | To accept the invitation, the bot shall request the person's phone number through Telegram contact sharing and accept the invitation only if it matches the number entered by the owner. | Must | PRP | An invitation opened from another Telegram account with a different phone number is rejected. |
| FR-INV-06 | Invitation links shall be single-use and expire after 14 days; the owner can resend an invitation. | Should | ASM | A used or expired link is rejected; a resent invitation generates a new link. |
| FR-INV-07 | The owner shall see the status of each invitation (sent, accepted, declined, expired). The activation is armed only when at least *k* trusted persons and every recipient have accepted. | Must | PRP | With fewer than *k* accepted trusted persons the configuration is marked "not ready" and activation is not armed. |

## 6.4 Non-functional requirements — Security, reliability, performance

| ID | Category | Requirement | Priority | Source | Metric / acceptance criterion |
|---|---|---|---|---|---|
| NFR-SEC-01 | Security | Zero-knowledge: the server never receives or stores plaintext content, master passwords, unencrypted private keys or a complete capsule key. | Must | PRP, INT (F-11) | Review of the database dump and API traffic finds none of these values. |
| NFR-SEC-02 | Security | Only established cryptographic implementations are used (WebCrypto API, libsodium, an audited Shamir library); no custom cryptographic primitives. | Must | LIT | Dependency list contains only approved libraries; no own implementations of encryption or key splitting. |
| NFR-SEC-03 | Security | A threat model is documented covering: compromised server, a single malicious trusted person, collusion of fewer than *k* trusted persons, false triggering, a lost phone or hijacked Telegram account of a trusted person or recipient, a forwarded invitation link, suppression of the activation by a person holding the owner's phone (SMS check-in links) and the server-enforced capsule release delay. | Must | PRP, LIT | Each threat has a described countermeasure linked to requirements. |
| NFR-SEC-04 | Security | All traffic uses HTTPS (TLS 1.2+) with HSTS. | Must | LIT | TLS check shows no weaker protocols; HTTP redirects to HTTPS. |
| NFR-SEC-05 | Security | Login, check-in and confirmation endpoints are rate-limited. | Must | LIT | More than 10 failed attempts per minute from one account or IP are blocked. |
| NFR-SEC-06 | Security | Owners can enable two-factor authentication (TOTP). | Should | ASM | With 2FA enabled, login without the second factor is impossible. |
| NFR-SEC-07 | Security | Logs contain no content, keys, shares or passwords. | Must | LIT | Log review finds no sensitive values. |
| NFR-LAW-01 | Compliance | Personal data of users is stored on servers located in Kazakhstan. | Should | LAW | Hosting provider and data location are documented. |
| NFR-REL-01 | Reliability | Check-in, confirmation and waiting-period timers fire no later than 1 hour after the due time and are not lost after a server restart. | Must | ASM | Test with a restart during an active timer shows correct firing within 1 hour. |
| NFR-REL-02 | Reliability | A failure of one notification channel does not block others; failed deliveries are retried at least 3 times. | Must | ASM | With one channel disabled, notifications still arrive through the others; retries are logged. |
| NFR-PERF-01 | Performance | Encrypting and splitting a 10 MB capsule takes ≤ 3 s in the browser. | Should | ASM | Measured in Chrome on a mid-range laptop (median of 10 runs). |
| NFR-PERF-02 | Performance | Key derivation with Argon2id takes ≤ 2 s on a mid-range smartphone. | Should | ASM | Measured in a mobile browser (median of 10 runs). |
| NFR-CAP-01 | Capacity | The total size of encrypted files in one capsule is limited to 50 MB. | Should | ASM | Uploading a capsule larger than 50 MB is rejected with a clear message. |

## 6.5 Functional requirements — Owner cabinet (FR-OWN)

*To be added in DIP-15.*

## 6.6 Functional requirements — Trusted person and recipient interface: bot and Mini App (FR-TRU)

*To be added in DIP-15.*

## 6.7 Functional requirements — Notifications (FR-NOT)

*To be added in DIP-15.*

## 6.8 Non-functional requirements — Usability and localization (NFR-USE, NFR-L10N)

*To be added in DIP-15.*

## 6.9 Constraints

| ID | Constraint | Impact |
|---|---|---|
| CON-01 | A Telegram bot cannot send the first message to a user who has never started it. | Invitations are delivered by SMS and, optionally, by the owner from their own Telegram account (FR-INV-02, FR-INV-03); the bot writes only after the person presses Start. |
| CON-02 | Telegram SecureStorage holds up to 10 items per user per bot and can restore a value only on the same device. | One key pair per person; a lost or replaced phone requires re-creating the shares (FR-CRY-08, FR-CRY-10). |
| CON-03 | SecureStorage is documented for the iOS and Android Telegram clients; support in Telegram Desktop and Web must be verified on the prototype. | Trusted persons and recipients are expected to use mobile Telegram. |
| CON-04 | The participation of trusted persons and recipients depends on the availability of Telegram. | The owner is advised to choose *n* greater than *k*; SMS remains a fallback for invitations and notifications. |
