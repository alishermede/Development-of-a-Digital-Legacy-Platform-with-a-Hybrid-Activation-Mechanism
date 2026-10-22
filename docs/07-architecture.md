# 7. Architecture and Diagrams

| Section | Responsible |
|---|---|
| 7.1 System context | Alisher Medebaev (DIP-16) |
| 7.2 Use cases | Aibyn Samat (DIP-17) |
| 7.3 Components (draft), 7.4 Trust boundaries and data protection, 7.5 Activation state machine | Alisher Medebaev (DIP-18) |

## 7.1 System context

![System context diagram](../diagrams/export/01-system-context.png)

Source: [`diagrams/src/01-system-context.puml`](../diagrams/src/01-system-context.puml) (C4 model, level 1)

The diagram shows the Digital Legacy Platform as one system, the people who use it and the external services it depends on.

### People

| Actor | Interface | Interaction with the system | Related requirements |
|---|---|---|---|
| Owner | Web application (registered account) | Creates encrypted capsules, configures trusted persons, recipients, check-in interval and waiting period, answers check-ins, cancels the activation | FR-CRY-01…03, FR-ACT-01…05, FR-ACT-10 |
| Trusted person | Telegram bot and Mini App (no registration) | Accepts the invitation, generates a key pair on the phone, keeps an encrypted key share, confirms the event | FR-CRY-03a, FR-CRY-05, FR-CRY-06, FR-INV-01…05 |
| Recipient | Telegram bot and Mini App (no registration) | Accepts the invitation, generates a key pair on the phone, receives and decrypts the capsule after release | FR-CRY-03a, FR-CRY-07, FR-ACT-11, FR-INV-01…05 |

### External systems

| System | Purpose | Data exchanged | Related requirements |
|---|---|---|---|
| Telegram (Bot API, Mini App platform) | Invitations, check-ins, confirmation requests and notifications; runs the Mini App; SecureStorage keeps private keys on the user's phone | Bot messages; from the Mini App: public keys, encrypted shares, confirmations; to the Mini App: encrypted capsules and shares | FR-ACT-02, FR-INV-04, FR-CRY-03a, CON-01…04 |
| SMS gateway | SMS invitations with a link to the bot, check-ins | Invitation links, check-in messages | FR-INV-02, FR-ACT-02 |
| Email service | Owner registration and waiting-period notifications | Email messages | FR-ACT-09 |

### Key properties shown by the diagram

- The platform receives and stores only ciphertext, encrypted key shares and public keys (NFR-SEC-01). Private keys stay in the owner's browser (encrypted) or in Telegram SecureStorage on the phones of trusted persons and recipients.
- Trusted persons and recipients interact only through Telegram; a Telegram bot cannot write first, so the first contact is an SMS invitation (CON-01).
- Telegram, SMS and email carry only messages and links; they never receive keys or plaintext capsule content.

## 7.2 Use cases

*To be added in DIP-17.*

## 7.3 Components (draft)

![Component diagram](../diagrams/export/03-components.png)

Source: [`diagrams/src/03-components.puml`](../diagrams/src/03-components.puml) (C4 model, levels 2–3)

The backend is a **modular monolith** on Spring Boot 4.1 (section 5.1): one deployable application with modules separated by interfaces. For a team of two this keeps one deployment, one database transaction for a state change and its timer (section 5.4b), and still allows a module to be extracted later. The frontend is one React code base with two entry points: the owner web application and the Telegram Mini App (section 5.6).

| Zone | Component | Responsibility | Main requirements |
|---|---|---|---|
| Owner's browser | Owner Web App | Capsule editor, setup wizard, dashboard, settings | FR-OWN-01…13, NFR-USE-04 |
| Owner's browser | Crypto Core | AES-256-GCM, Argon2id + HKDF (encryption and authentication keys), X25519 sealed boxes, key splitting, safety codes | FR-CRY-01…05, FR-CRY-11, FR-CRY-12 |
| Phone of trusted person / recipient | Telegram Mini App | Invitation and consent, key check, confirmation, opening capsules | FR-INV-04…08, FR-TRU-01…10 |
| Phone of trusted person / recipient | Crypto Core + SecureStorage adapter | Key pair in SecureStorage, share re-encryption, key reconstruction | FR-CRY-03a, FR-CRY-06, FR-CRY-07, FR-CRY-10 |
| Server | REST API | Single entry point for both clients; per-endpoint rate limiting | NFR-SEC-04, NFR-SEC-05 |
| Server | Identity & Auth | Owner accounts and sessions, TOTP, validation of Telegram init data | FR-OWN-01, FR-CRY-12, NFR-SEC-06 |
| Server | Capsule Service | Stores and returns ciphertext through the `FileStorage` interface; 50 MB limit | FR-OWN-02…05, NFR-CAP-01 |
| Server | Trust Network Service | Trusted persons, recipients, invitations, consent, public keys, key verification status | FR-INV-01…08, FR-CRY-11, FR-OWN-06 |
| Server | Share Vault | Encrypted shares; release after the waiting period and the capsule delay | FR-CRY-05, FR-CRY-06, FR-ACT-11, FR-ACT-15 |
| Server | Activation Engine | State machine (section 7.5) and Quartz timers for check-ins, escalation, waiting period and release | FR-ACT-01…16, NFR-REL-01 |
| Server | Notification Service | Notification catalogue; `SmsGateway`, `EmailGateway`, `TelegramGateway`; retries | FR-NOT-01…10, NFR-REL-02 |
| Server | Telegram Bot Adapter | Webhook, welcome message, buttons, contact sharing | FR-INV-04, FR-INV-05, CON-01 |
| Server | Audit Log | History of transitions and notifications without sensitive data | FR-ACT-13, NFR-SEC-07 |
| Storage | PostgreSQL | All persistent data, including Quartz job tables | section 5.2 |

The draft will be refined when the implementation starts; module boundaries and names may change.

## 7.4 Trust boundaries and data protection

There are two trusted zones: the owner's browser and the phone of each trusted person or recipient. Everything else — the server, the database, Telegram, the SMS gateway and the email service — is **untrusted for confidentiality**: it may see metadata, but never plaintext or keys.

| Data | Where it is stored | Form | Requirements |
|---|---|---|---|
| Capsule content and files | PostgreSQL | Ciphertext only (AES-256-GCM) | FR-CRY-01, NFR-SEC-01 |
| Capsule key | Nowhere as a whole | *k* ≥ 2: Shamir shares, each sealed for one trusted person; *k* = 1: a sealed copy per trusted person | FR-CRY-04, FR-CRY-05 |
| Master password | Nowhere | Known only to the owner | FR-CRY-02 |
| Owner's authentication key | PostgreSQL | Slow hash only | FR-CRY-12 |
| Owner's private key | PostgreSQL | Encrypted with the key derived from the master password | FR-CRY-03 |
| Private key of a trusted person or recipient | Telegram SecureStorage on their phone | Never leaves the device | FR-CRY-03a |
| Public keys | PostgreSQL | Plain; authenticity checked with safety codes | FR-CRY-11 |
| Shares submitted on confirmation | PostgreSQL | Sealed for the recipient | FR-CRY-06 |
| Name and phone number of invited persons | PostgreSQL | Plain (needed for SMS); deleted after a decline or expiry | FR-INV-08, NFR-LAW-01 |
| Messages via Telegram, SMS, email | External providers | Owner's name and links only | FR-NOT-07 |

**What the server is trusted for.** The server cannot read capsules, but it is trusted for **availability and timing**: it runs the timers and decides when shares are released (waiting period, capsule delay). A compromised server alone still cannot decrypt anything; a compromised server colluding with a recipient could release shares to that recipient early. This, the substitution of public keys (mitigated by FR-CRY-11) and the suppression of activation by a person holding the owner's phone are recorded for the threat model (NFR-SEC-03).

## 7.5 Activation state machine

![Activation state machine](../diagrams/export/04-activation-state-machine.png)

Source: [`diagrams/src/04-activation-state-machine.puml`](../diagrams/src/04-activation-state-machine.puml) (UML state machine)

There is one process per owner (FR-ACT-14). Every transition and the timer that belongs to it are changed in one database transaction (section 5.4b) and recorded in the audit log (FR-ACT-06, FR-ACT-13).

| From | Event | To | Effect | Requirements |
|---|---|---|---|---|
| NOT ARMED | At least *k* trusted persons and every recipient have accepted | ACTIVE | First check-in is scheduled | FR-INV-07 |
| ACTIVE | Fewer than *k* trusted persons remain (declined, removed, key lost) | NOT ARMED | Owner notified | FR-TRU-06, FR-CRY-10 |
| ACTIVE | Scheduled check-in missed | CHECK-IN PENDING | Repeated check-in at +2 days | FR-ACT-03 |
| CHECK-IN PENDING | Answer (Telegram button, or SMS link and "I'm OK") | ACTIVE | Next check-in scheduled | FR-ACT-03, FR-ACT-16 |
| CHECK-IN PENDING | Final check-in (day +3) missed | AWAITING CONFIRMATION | Trusted persons notified | FR-ACT-07, FR-NOT-04 |
| AWAITING CONFIRMATION | Confirmation or withdrawal by a trusted person | AWAITING CONFIRMATION | Count of distinct confirmations updated | FR-ACT-08, FR-ACT-12 |
| AWAITING CONFIRMATION | *k*-th distinct confirmation | WAITING PERIOD | Owner notified on all channels, then every 24 h | FR-ACT-08, FR-ACT-09 |
| AWAITING CONFIRMATION, WAITING PERIOD | Owner cancels with the master password | CANCELLED → ACTIVE | Submitted shares deleted, trusted persons notified | FR-ACT-10 |
| WAITING PERIOD | Waiting period ends | RELEASED | Each capsule enters LOCKED | FR-ACT-11 |

After RELEASED, each capsule follows its own release delay (FR-ACT-15): **LOCKED → AVAILABLE** when the delay is 0, otherwise **LOCKED → SCHEDULED → AVAILABLE**. A recipient is notified when a capsule becomes AVAILABLE (FR-NOT-06) and sees a SCHEDULED capsule only as unavailable until its date (FR-TRU-08).

Any transition not listed in the table is rejected. In particular, an SMS check-in link cannot leave WAITING PERIOD (FR-ACT-16), and missed check-ins can never lead to RELEASED without *k* confirmations (FR-ACT-07).
