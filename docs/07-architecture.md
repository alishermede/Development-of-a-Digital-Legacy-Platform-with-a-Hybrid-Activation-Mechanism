# 7. Architecture and Diagrams

| Section | Responsible |
|---|---|
| 7.1 System context | Alisher Medebaev (DIP-16) |
| 7.2 Use cases | Aibyn Samat (DIP-17) |
| 7.3 Components (draft), 7.4 Trust boundaries, 7.5 Activation state machine | Alisher Medebaev (DIP-18) |

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

*To be added in DIP-18.*

## 7.4 Trust boundaries and data protection

*To be added in DIP-18.*

## 7.5 Activation state machine

*To be added in DIP-18.*
