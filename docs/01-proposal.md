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

- **Platform tools** (Google Inactive Account Manager, Apple Legacy Contact) work only within their own ecosystem.
- **Password managers** (Bitwarden, 1Password) offer emergency access to one contact and cover only stored credentials.
- **Dedicated digital legacy services** usually rely on a single trigger (missed check-ins or one person's claim). This leads either to **false activation**, when the owner simply forgot to respond, or to **abuse by one trusted person**. Many of them also require full trust in the provider, which can technically read the data.
- **A notarial will** is not designed for passwords and frequently changing digital data, and it puts the data at risk of disclosure.

In addition, no such service is localized for Kazakhstan (Kazakh and Russian interface, local inheritance and personal data legislation).

Therefore, there is a need for a platform that transfers digital data **only when the event is actually confirmed**, does not depend on trust in one person or in the provider, and stays resistant to false activations.

*The relevance of the problem will be confirmed by user interviews (`docs/02-relevance-evidence/`) and the comparison of existing systems (`docs/04-existing-systems.md`).*

## 1.4 Target users

| Role | Description | Needs |
|---|---|---|
| **Owner** | Adult with many online accounts; small business owner with business accounts | Leave data and instructions to specific people, keep data private while alive, avoid false transfer |
| **Trusted person** | Relative or close friend chosen by the owner | Simple, free way to confirm the event without technical knowledge |
| **Recipient** | Person who receives a capsule after activation | Clear access to the data and messages intended for them |

## 1.5 Aim

To develop a web platform for transferring digital legacy that releases the owner's encrypted data to chosen recipients only after a hybrid activation — missed check-ins, confirmation by *k* of *n* trusted persons using Shamir's Secret Sharing, and a waiting period with the right to cancel — so that neither the service provider nor any single person can access the data alone.

## 1.6 Objectives

1. Analyse existing digital legacy solutions and literature on secret sharing, client-side encryption and activation protocols, and identify their limitations.
2. Collect and confirm requirements through 3–5 interviews with potential users and domain experts.
3. Design a cryptographic protocol and threat model that define who holds which key or share and when data can be decrypted.
4. Implement client-side encryption (AES-256-GCM, Argon2id) and *k*-of-*n* key splitting with Shamir's Secret Sharing, including recovery with printable paper shares.
5. Implement the hybrid activation mechanism as a state machine (check-ins → trustee confirmation → waiting period → release or cancellation) with notifications via email, SMS and Telegram.
6. Develop owner, trusted person and recipient interfaces in Kazakh and Russian.
7. Evaluate the system against a simple dead man's switch baseline on false activation, resistance to unauthorized access and usability (SUS ≥ 70).

## 1.7 Expected outcomes

- A working web application with owner, trusted person and recipient flows.
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
- *k*-of-*n* confirmation by trusted persons using Shamir's Secret Sharing.
- Check-ins and notifications via email, SMS and Telegram.
- Waiting period with notifications and owner cancellation.
- Printable key shares with QR codes for recovery without the service.
- Kazakh and Russian interface.
- Consideration of Kazakhstan legislation on inheritance and personal data storage.

**Out of scope**

- Banking access and cryptocurrency wallets.
- Legal transfer of property and replacement of a notarial will.
- Native mobile applications (responsive web only).
- Development of new cryptographic algorithms (only proven libraries are used).
- Integration with government services (e.g. automatic death registry check).

## 1.9 Engineering complexity

1. **Zero-knowledge architecture.** All encryption and decryption happen in the browser; the server must work correctly without ever seeing plaintext or a complete key.
2. **Threshold cryptographic protocol.** Splitting the key with Shamir's Secret Sharing, securely delivering each share to a trusted person (encrypted under their own key) and reconstructing the key only when *k* shares are submitted.
3. **Hybrid activation state machine.** Combining time-based triggers, confirmations from several independent people and a cancellable waiting period, while correctly handling edge cases (owner returns, trusted person unavailable, repeated confirmations).
4. **Reliable multi-channel notifications.** Timely delivery through email, SMS and Telegram, since a missed notification can lead to false activation.
5. **Key recovery without the provider.** The owner may forget the password, and recipients must be able to recover data even if the service stops working (paper shares).
6. **Threat modelling.** Protection against a compromised server, a single malicious trusted person, collusion of fewer than *k* persons and false triggers.
