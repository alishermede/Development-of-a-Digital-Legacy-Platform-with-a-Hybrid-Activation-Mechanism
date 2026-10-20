# Digital Legacy Platform with a Hybrid Activation Mechanism Based on Shamir's Secret Sharing

> RU: Разработка платформы цифрового наследия с гибридным механизмом активации на основе схемы разделения секрета Шамира
> KZ: Шамирдің құпияны бөлу схемасына негізделген гибридті іске қосу механизмі бар цифрлық мұра платформасын әзірлеу

Bachelor diploma project, Software Engineering, Astana IT University, 2026–2027.

A web platform where a person decides in advance who receives their important digital data — account credentials, instructions ("where the documents are", "which subscriptions to cancel"), files and photos, personal messages and business access (domain, hosting, business social media) — if something happens to them. Data is encrypted on the owner's device; the server stores only ciphertext and cannot read it. Access is released only by a **hybrid activation mechanism** that combines missed check-ins, confirmation by *k* of *n* trusted persons (Shamir's Secret Sharing) and a waiting period with the right to cancel.

## Problem statement

People accumulate critical digital assets but have no safe, practical way to hand them over. Existing options are either limited to one ecosystem (Google Inactive Account Manager, Apple Legacy Contact), cover only passwords with a single emergency contact (password managers), rely on a single trigger that causes false activations or requires trusting one person or the provider (dead man's switch services), or are not designed for digital credentials at all (notarial will). No such service targets Kazakhstan: Kazakh/Russian interface and local legal context (inheritance law, personal data localization).

## Target users

- **Owners** — adults who want to leave digital assets and instructions to relatives or partners; small business owners with business accounts.
- **Trusted persons (trustees)** — relatives or friends who hold a key share and confirm the event; always free of charge.
- **Recipients** — people who receive a capsule after activation.

## Expected outcomes

- Working web application (owner, trustee and recipient flows) with client-side encryption (AES-256-GCM, Argon2id).
- Cryptographic core: key splitting with Shamir's Secret Sharing (k-of-n), encrypted share distribution to trustees, recovery protocol, printable paper shares with QR codes.
- Hybrid activation state machine: missed check-ins → k-of-n trustee confirmation → waiting period with owner cancellation.
- Threat model and protocol specification.
- Evaluation against a single-trigger dead man's switch baseline (false activations, unauthorized access, usability).

## Team

| Member | Group | Responsibilities |
|---|---|---|
| Alisher Medebaev | SE-2414 | Backend, cryptographic core (client-side encryption, Shamir secret sharing, recovery protocol), hybrid activation mechanism, threat model, repository and YouTrack administration |
| Aibyn Samat | SE-2415 | Frontend and platform: owner, trustee and recipient cabinets, check-ins, notifications (email, SMS, Telegram), user research, literature review, existing system comparison, mockups, usability evaluation |

**Supervisor:** Tutkyshbayeva Sh.S.

Full responsibility matrix: `docs/10-project-management.md`.

## Project scope

**In scope:** credentials, text instructions, files and photos, personal messages, business access; client-side encryption; k-of-n trustee confirmation; check-ins via email/SMS/Telegram; waiting period and cancellation; paper key shares; Kazakh and Russian UI.

**Out of scope:** banking access and crypto wallets; legal transfer of property; native mobile apps (responsive web only); custom cryptographic algorithms (only vetted libraries are used).

## Current status

**Stage: analysis and design (pre-defense 1, 24 October 2026).** No runnable code yet — see the [project management document](docs/10-project-management.md) for milestones.

| Deliverable | Location | Status |
|---|---|---|
| Project proposal and scope | [docs/01-proposal.md](docs/01-proposal.md) | In progress |
| Evidence of relevance (interviews) | [docs/02-relevance-evidence/](docs/02-relevance-evidence/) | In progress |
| Literature review | [docs/03-literature-review.md](docs/03-literature-review.md) | In progress |
| Existing system comparison | [docs/04-existing-systems.md](docs/04-existing-systems.md) | In progress |
| Technology comparison | [docs/05-technology-comparison.md](docs/05-technology-comparison.md), [docs/adr/](docs/adr/) | In progress |
| Requirements and acceptance criteria | [docs/06-requirements.md](docs/06-requirements.md) | In progress |
| Architecture and diagrams | [docs/07-architecture.md](docs/07-architecture.md), [diagrams/](diagrams/) | In progress |
| UX prototype and API examples | [docs/08-prototype.md](docs/08-prototype.md), [prototype/](prototype/) | In progress |
| Verification and evaluation plan | [docs/09-verification-plan.md](docs/09-verification-plan.md) | In progress |
| Project management and risks | [docs/10-project-management.md](docs/10-project-management.md) | In progress |
| Supervisor feedback | [docs/11-supervisor-feedback.md](docs/11-supervisor-feedback.md) | In progress |

## Selected technologies (preliminary, justified in [docs/05](docs/05-technology-comparison.md))

| Area | Choice |
|---|---|
| Client-side encryption | WebCrypto API (AES-256-GCM), libsodium (sealed boxes for share delivery) |
| Key derivation | Argon2id |
| Secret sharing | Shamir's Secret Sharing (audited library, e.g. `shamir-secret-sharing`) |
| Frontend | React / Next.js, TypeScript |
| Backend | to be decided (see technology comparison) |
| Database | PostgreSQL; encrypted blobs in S3-compatible object storage |
| Notifications | Email, SMS gateway, Telegram Bot API |
| Infrastructure | Docker, GitHub Actions |

## Links

- **YouTrack project:** <https://diplom-digital-legacy.youtrack.cloud/projects/DIP>
- **Documentation (Word, formatted version):** https://astanait-my.sharepoint.com/:w:/g/personal/242551_astanait_edu_kz/IQA0Auwqv1QSS4dFHn9q1cK0AbuxJlQ6kyQyDXWBEQA3vsM?e=3PXiQ7
- **Documentation index:** [docs/](docs/)

## Repository structure

```
docs/            proposal, evidence, literature review, comparisons, requirements, architecture, plans
  adr/           architecture decision records
  submissions/   pre-defense submission summaries
diagrams/
  src/           editable diagram sources (PlantUML / draw.io)
  export/        readable exports (PNG / SVG)
prototype/
  mockups/       exported mockup screens
  api/           OpenAPI draft and example payloads
src/
  crypto-core/   client-side cryptography and Shamir protocol
  backend/       API, activation state machine, notifications
  frontend/      web application
tests/           automated tests and test materials
config/          configuration examples (no secrets)
```

## Setup, execution and testing

Not applicable yet: the project is in the analysis and design stage. Instructions will be added here as soon as runnable code is available.

