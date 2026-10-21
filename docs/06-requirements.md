# 6. Requirements Specification

**Priority:** MoSCoW (Must / Should / Could / Won't)

**Source codes:** PRP — project proposal; LIT — literature review; LAW — legislation of the Republic of Kazakhstan; ASM — assumption, to be confirmed by interviews (DIP-5, DIP-6)

**Terms**

- **Capsule** — an encrypted set of data (credentials, instructions, files, messages) intended for one or more recipients.
- **Capsule key (CK)** — a random 256-bit key that encrypts one capsule.
- **Share** — one of *n* parts of the capsule key created with Shamir's Secret Sharing; any *k* shares reconstruct the key.

| Section | Responsible |
|---|---|
| 6.1 Cryptographic core, 6.2 Hybrid activation, 6.3 Security, reliability and performance NFRs | Alisher Medebaev (DIP-14) |
| 6.4 Owner cabinet, 6.5 Trusted person and recipient, 6.6 Notifications, 6.7 Usability and localization NFRs | Aibyn Samat (DIP-15) |

## 6.1 Functional requirements — Cryptographic core (FR-CRY)

| ID | Requirement | Priority | Source | Acceptance criteria |
|---|---|---|---|---|
| FR-CRY-01 | The system shall encrypt capsule content in the owner's browser with AES-256-GCM using a random 256-bit capsule key before upload. | Must | PRP, LIT | Network traffic and the database contain only ciphertext; modified ciphertext fails to decrypt (authentication tag check). |
| FR-CRY-02 | The system shall derive the owner's key-encryption key from the master password with Argon2id in the browser. The master password shall never be sent to the server. | Must | PRP, LIT | Argon2id parameters are documented; no request contains the master password or a value from which it can be directly obtained. |
| FR-CRY-03 | The system shall generate an X25519 key pair for each owner, trusted person and recipient in their browser. Private keys shall be stored on the server only in encrypted form. | Must | LIT | The stored private key cannot be used without the user's password; the server-side database contains no plaintext private keys. |
| FR-CRY-04 | The system shall split the capsule key into *n* shares with threshold *k* (1 ≤ *k* ≤ *n* ≤ 5) using Shamir's Secret Sharing from an audited library. | Must | PRP, LIT | Every combination of *k* shares reconstructs the key; every combination of *k*−1 shares fails to reconstruct it. |
| FR-CRY-05 | The system shall encrypt each share with the public key of the corresponding trusted person before it leaves the owner's browser. | Must | PRP | The server stores only encrypted shares; a share can be decrypted only with the private key of its trusted person. |
| FR-CRY-06 | When confirming the event, the trusted person's browser shall decrypt their share and re-encrypt it with the recipient's public key. | Must | PRP | The submitted share is readable only by the recipient; the server and other trusted persons cannot decrypt it. |
| FR-CRY-07 | After release, the recipient's browser shall reconstruct the capsule key from *k* shares and decrypt the capsule locally. | Must | PRP | The recipient sees the original content; decryption happens without sending the key to the server. |
| FR-CRY-08 | The system shall re-split the capsule key and invalidate old shares when the owner changes the trusted persons, *k* or *n*. | Must | ASM | Old shares cannot reconstruct the new key; removed trusted persons lose the ability to participate. |
| FR-CRY-09 | The system shall allow exporting each share as a printable document with a QR code, and provide an offline recovery tool that reconstructs the key from *k* paper shares without the server. | Should | PRP | With the service unavailable, *k* scanned QR codes and the encrypted capsule file restore the content. |
| FR-CRY-10 | The system shall generate a recovery key at registration that lets the owner regain access if the master password is forgotten. It is shown once and can be printed. | Should | ASM | An owner who lost the password restores access with the recovery key; without the password and the recovery key, access is impossible. |

## 6.2 Functional requirements — Hybrid activation (FR-ACT)

| ID | Requirement | Priority | Source | Acceptance criteria |
|---|---|---|---|---|
| FR-ACT-01 | The owner shall configure the check-in interval from 1 to 180 days (default: 30 days). | Must | PRP | Values outside the range are rejected; the next check-in is scheduled according to the saved interval. |
| FR-ACT-02 | Check-ins shall be sent via SMS and Telegram only. The owner shall configure at least one of these channels. | Must | PRP | No check-in is sent by email; saving settings without SMS or Telegram is rejected. |
| FR-ACT-03 | If a scheduled check-in is missed, the system shall send a repeated check-in after 2 days, and if that is missed, a final check-in after 1 more day. If the final check-in is missed, the activation process starts. | Must | PRP | Given no responses, exactly 3 check-ins are sent (day 0, day 2, day 3) and the state changes to AWAITING CONFIRMATION after the third is missed; a response at any step returns the state to ACTIVE. |
| FR-ACT-04 | The owner shall choose from 1 to 5 trusted persons (*n*) and the number of confirmations required (*k*), where 1 ≤ *k* ≤ *n*. | Must | PRP | *n* > 5 or *k* > *n* is rejected; the activation requires exactly *k* distinct confirmations. |
| FR-ACT-05 | The owner shall configure the waiting period from 1 to 60 days (default: 7 days). | Must | PRP | Values outside the range are rejected; new owners get 7 days by default. |
| FR-ACT-06 | The system shall implement activation as a state machine with the states ACTIVE, CHECK-IN PENDING, AWAITING CONFIRMATION, WAITING PERIOD, RELEASED, CANCELLED, allowing only defined transitions. | Must | PRP | Every invalid transition is rejected; every transition is recorded in the audit log with time and cause. |
| FR-ACT-07 | Missed check-ins shall only start the process (notification of trusted persons) and shall never release data by themselves. | Must | PRP | Given all check-ins missed and 0 confirmations, no capsule is released after any amount of time. |
| FR-ACT-08 | The process shall move to WAITING PERIOD only after confirmations from *k* different trusted persons. | Must | PRP | With *k*−1 confirmations the state does not change; repeated confirmation by the same person is counted once. |
| FR-ACT-09 | During the waiting period, the system shall notify the owner on all configured channels (SMS, Telegram, email) at its start and every 24 hours. | Must | PRP | Notification log shows delivery attempts on every channel at the start and at least once per day. |
| FR-ACT-10 | The owner shall be able to cancel the process at any state before RELEASED by entering the master password. Cancellation returns the process to ACTIVE, deletes submitted shares and notifies trusted persons. | Must | PRP | After cancellation, no submitted shares remain on the server and recipients get no access. |
| FR-ACT-11 | When the waiting period ends without cancellation, the system shall release the submitted shares to the recipients and notify them. | Must | PRP | Recipients receive access only after the waiting period has fully expired. |
| FR-ACT-12 | A trusted person shall be able to withdraw their confirmation before the waiting period starts. | Should | ASM | After withdrawal, the confirmation count decreases and the state is recalculated. |
| FR-ACT-13 | The owner shall see a history of all activation events (check-ins, confirmations, cancellations, notifications). | Should | ASM | All events from FR-ACT-06 are visible to the owner in chronological order. |

## 6.3 Non-functional requirements — Security, reliability, performance

| ID | Category | Requirement | Priority | Source | Metric / acceptance criterion |
|---|---|---|---|---|---|
| NFR-SEC-01 | Security | Zero-knowledge: the server never receives or stores plaintext content, master passwords, unencrypted private keys or a complete capsule key. | Must | PRP | Review of the database dump and API traffic finds none of these values. |
| NFR-SEC-02 | Security | Only established cryptographic implementations are used (WebCrypto API, libsodium, an audited Shamir library); no custom cryptographic primitives. | Must | LIT | Dependency list contains only approved libraries; no own implementations of encryption or key splitting. |
| NFR-SEC-03 | Security | A threat model is documented covering: compromised server, a single malicious trusted person, collusion of fewer than *k* trusted persons, false triggering. | Must | PRP, LIT | Each threat has a described countermeasure linked to requirements. |
| NFR-SEC-04 | Security | All traffic uses HTTPS (TLS 1.2+) with HSTS. | Must | LIT | TLS check shows no weaker protocols; HTTP redirects to HTTPS. |
| NFR-SEC-05 | Security | Login, check-in and confirmation endpoints are rate-limited. | Must | LIT | More than 10 failed attempts per minute from one account or IP are blocked. |
| NFR-SEC-06 | Security | Owners can enable two-factor authentication (TOTP). | Should | ASM | With 2FA enabled, login without the second factor is impossible. |
| NFR-SEC-07 | Security | Logs contain no content, keys, shares or passwords. | Must | LIT | Log review finds no sensitive values. |
| NFR-LAW-01 | Compliance | Personal data of users is stored on servers located in Kazakhstan. | Should | LAW | Hosting provider and data location are documented. |
| NFR-REL-01 | Reliability | Check-in, confirmation and waiting-period timers fire no later than 1 hour after the due time and are not lost after a server restart. | Must | ASM | Test with a restart during an active timer shows correct firing within 1 hour. |
| NFR-REL-02 | Reliability | A failure of one notification channel does not block others; failed deliveries are retried at least 3 times. | Must | ASM | With one channel disabled, notifications still arrive through the others; retries are logged. |
| NFR-PERF-01 | Performance | Encrypting and splitting a 10 MB capsule takes ≤ 3 s in the browser. | Should | ASM | Measured in Chrome on a mid-range laptop (median of 10 runs). |
| NFR-PERF-02 | Performance | Key derivation with Argon2id takes ≤ 2 s on a mid-range smartphone. | Should | ASM | Measured in a mobile browser (median of 10 runs). |

## 6.4 Functional requirements — Owner cabinet (FR-OWN)

*To be added in DIP-15.*

## 6.5 Functional requirements — Trusted person and recipient (FR-TRU)

*To be added in DIP-15.*

## 6.6 Functional requirements — Notifications (FR-NOT)

*To be added in DIP-15.*

## 6.7 Non-functional requirements — Usability and localization (NFR-USE, NFR-L10N)

*To be added in DIP-15.*
