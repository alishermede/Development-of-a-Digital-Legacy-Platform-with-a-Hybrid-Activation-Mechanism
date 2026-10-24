# 1. Project Proposal

## 1.1 Title

- **EN:** Development of a Digital Legacy Platform with a Hybrid Activation Mechanism Based on Shamir's Secret Sharing
- **RU:** Разработка платформы цифрового наследия с гибридным механизмом активации на основе схемы разделения секрета Шамира
- **KZ:** Шамирдің құпияны бөлу схемасына негізделген гибридті іске қосу механизмі бар цифрлық мұра платформасын әзірлеу

## 1.2 Team and supervisor

| Member | Group | Role |
|---|---|---|
| Alisher Medebaev | SE-2414 | Backend, cryptographic core, hybrid activation mechanism, architecture |
| Aibyn Samat | SE-2415 | Frontend and platform: user cabinets, check-ins, notifications, user research |

**Supervisor:** Tutkyshbayeva Sh.S.

## 1.3 Problem statement

A modern person owns a large number of digital assets: accounts in email, social networks and government services, cloud files and photos, subscriptions, domains, hosting and business accounts. Much of this information exists only in the owner's memory or on their devices. If the owner dies or becomes incapacitated, relatives often cannot access important data, cancel paid subscriptions, recover family photos or keep a small business running.

Existing solutions address this problem only partially:

- **Platform tools** work only within their own ecosystem. Google Inactive Account Manager shares selected Google data with up to 10 contacts after 3–18 months of inactivity. Apple Legacy Contact requires an access key and a death certificate and does not transfer passwords.
- **Password managers** cover only stored credentials. Bitwarden Emergency Access lets **any single** trusted contact obtain the vault after a waiting time that the owner can interrupt; 1Password has no built-in emergency access and relies on a printed Emergency Kit.
- **Dedicated digital legacy services** usually rely on a single trigger (missed check-ins or one person's claim). This leads either to **false activation**, when the owner simply forgot to respond, or to **abuse by one trusted person**. Many of them also require trust in the provider, which can technically read the data.
- **A notarial will** is not designed for passwords and frequently changing digital data, and it puts the data at risk of disclosure.

In addition, no such service is localized for Kazakhstan (Kazakh and Russian interface, local inheritance and personal data legislation).

None of these solutions combines **activity check-ins, confirmation by several independent people (*k* of *n*) and a cancellable waiting period**, while keeping the data unreadable for the provider. Therefore, there is a need for a platform that transfers digital data **only when the event is actually confirmed**, does not depend on trust in the provider, lets the owner decide how many people must confirm the event, and stays resistant to false activations.

*The relevance of the problem will be confirmed by user interviews (`docs/02-relevance-evidence/`) and the comparison of existing systems (`docs/04-existing-systems.md`).*

## 1.4 Target users

| Role | Description | Needs |
|---|---|---|
| **Owner** | Adult with many online accounts; small business owner with business accounts | Leave data and instructions to specific people, keep data private while alive, avoid false transfer |
| **Trusted person** | Relative or close friend chosen by the owner | Simple, free way to confirm the event without technical knowledge and without registration (Telegram only) |
| **Recipient** | Person who receives a capsule after activation | Clear access to the data and messages intended for them, without registration (Telegram only) |

## 1.5 Aim

To develop a digital legacy platform that transfers the owner's encrypted data to chosen recipients only after a confirmed event, without trust in the provider and with protection against false activation.

How the aim is reached (client-side encryption, hybrid activation with *k*-of-*n* confirmation by Shamir's Secret Sharing, waiting period with cancellation) is described by objectives 3–5, and how it is checked by objective 7.

## 1.6 Objectives

1. Analyse existing digital legacy solutions and literature on secret sharing, client-side encryption and activation protocols, and identify their limitations.
2. Collect and confirm requirements through 3–5 interviews with potential users and domain experts.
3. Design a cryptographic protocol and threat model that define who holds which key or share and when data can be decrypted.
4. Implement client-side encryption (AES-256-GCM, Argon2id) and *k*-of-*n* key splitting with Shamir's Secret Sharing, including owner access recovery with a recovery key.
5. Implement the hybrid activation mechanism as a state machine (check-ins → trustee confirmation → waiting period → release or cancellation) with check-ins via SMS and Telegram and notifications via SMS, Telegram and email.
6. Develop a web application for owners and a Telegram bot with Mini App for trusted persons and recipients (no registration), in Kazakh and Russian.
7. Evaluate the system against a simple dead man's switch baseline on false activation, resistance to unauthorized access and usability (SUS ≥ 70). The metrics, scenarios and thresholds are defined in `docs/09-verification-plan.md` (M1–M12).
8. Analyse the requirements of the Law of the Republic of Kazakhstan on personal data and of inheritance law and reflect them in the requirements and in the hosting decision (task DIP-26).

## 1.7 Expected outcomes

- A working web application for owners and a Telegram bot with Mini App for trusted persons and recipients.
- A cryptographic core: client-side encryption, Shamir key splitting, encrypted share delivery and recovery.
- A hybrid activation mechanism with configurable *k*, *n*, check-in interval and waiting period.
- Protocol specification and threat model.
- Test and evaluation results compared with the baseline solution.
- Project documentation and the diploma thesis.

## 1.8 Scope

**In scope**

- Data types: account credentials, text instructions, files and photos, personal messages, business access (domain, hosting, business social media).
- Separate capsules for different recipients.
- Client-side encryption: the server stores only ciphertext.
- *k*-of-*n* confirmation by trusted persons using Shamir's Secret Sharing (owner chooses *k*, default 2).
- Trusted persons and recipients without registration: invitation by SMS and Telegram, interaction through a Telegram bot and Mini App.
- Check-ins via SMS and Telegram; notifications via SMS, Telegram and email.
- Waiting period with notifications and owner cancellation.
- Kazakh and Russian interface.
- Consideration of Kazakhstan legislation on inheritance and personal data storage.

**Out of scope**

- Banking access and cryptocurrency wallets.
- Legal transfer of property and replacement of a notarial will.
- Native mobile applications (responsive web application and Telegram Mini App only).
- Interaction for trusted persons and recipients through messengers other than Telegram.
- Development of new cryptographic algorithms (only proven libraries are used).
- Integration with government services (e.g. automatic death registry check).
- Data recovery without the service (offline tools, printed key shares).

## 1.9 Engineering complexity

1. **Zero-knowledge architecture.** All encryption and decryption happen in the browser; the server must work correctly without ever seeing plaintext or a complete key.
2. **Threshold cryptographic protocol.** Splitting the key with Shamir's Secret Sharing, securely delivering each share to a trusted person (encrypted under their own key) and reconstructing the key only when *k* shares are submitted.
3. **Keys without registration.** Trusted persons and recipients have no account: their key pairs are generated inside a Telegram Mini App and kept in the phone's secure storage, so the protocol must handle lost devices, identity verification by phone number and the fact that a Telegram bot cannot write to a user first.
4. **Hybrid activation state machine.** Combining time-based triggers, confirmations from several independent people and a cancellable waiting period, while correctly handling edge cases (owner returns, trusted person unavailable, repeated confirmations).
5. **Reliable multi-channel notifications.** Timely delivery through SMS, Telegram and email, since a missed notification can lead to false activation.
6. **Key recovery.** The owner may forget the master password; access must be recoverable with a recovery key without letting the provider read the data.
7. **Threat modelling.** Protection against a compromised server, a single malicious trusted person, collusion of fewer than *k* persons, a lost phone or hijacked Telegram account of a trusted person, and false triggers.
