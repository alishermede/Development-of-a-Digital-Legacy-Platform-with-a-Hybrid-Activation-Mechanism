# Source code

Implementation starts after pre-defense 1 (milestone M8 in `docs/10-project-management.md`). The folders follow the components in `docs/07-architecture.md`, section 7.3.

| Folder | Component | Technology (section 5) | Responsible |
|---|---|---|---|
| [`crypto-core/`](crypto-core/) | Crypto Core shared by the owner web application and the Mini App | TypeScript, WebCrypto, libsodium-wrappers-sumo, shamir-secret-sharing | Alisher Medebaev |
| [`backend/`](backend/) | REST API, Activation Engine, Share Vault, Trust Network, notifications, Telegram bot adapter | Java 21, Spring Boot 4.1, Quartz, PostgreSQL | Alisher Medebaev |
| [`frontend/`](frontend/) | Owner web application and Telegram Mini App (two entry points, one code base) | React, TypeScript, Vite | Aibyn Samat |
