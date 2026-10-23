# API examples (DIP-20)

Draft REST API: [`openapi.yaml`](openapi.yaml) (OpenAPI 3.0.3, validated with `openapi-spec-validator`). Open it in [Swagger Editor](https://editor.swagger.io) to browse the endpoints and examples. This file is the content of section 8.2 of `docs/08-prototype.md`.

The examples show one property of the design: **the server receives only ciphertext, sealed shares and public keys** (NFR-SEC-01). Every value marked `base64:…` is encrypted or is a public key.

## Clients and authentication

| Client | Authentication | Requirements |
|---|---|---|
| Owner web application | Session cookie after login with an authentication key derived from the master password; the master password and the encryption key never leave the browser | FR-CRY-12, FR-OWN-01 |
| Telegram Mini App (trusted persons, recipients) | Header `X-Telegram-Init-Data`, validated by the server; no account | FR-INV-01 |
| SMS check-in page | Single-use token of at least 128 bits in the link | FR-ACT-16 |
| Telegram bot | Webhook with the secret token header | CON-01 |

## Endpoints

| Group | Endpoints | Requirements |
|---|---|---|
| Auth | `GET /auth/prelogin`, `POST /auth/register`, `POST /auth/login` | FR-OWN-01, FR-CRY-02, FR-CRY-03, FR-CRY-09, FR-CRY-12 |
| Capsules | `GET/POST /capsules`, `GET/PUT/DELETE /capsules/{id}`, `PUT /capsules/{id}/content` | FR-OWN-02…05, FR-ACT-15, NFR-CAP-01 |
| Shares | `PUT /capsules/{id}/shares` | FR-CRY-04, FR-CRY-05, FR-CRY-08 |
| Persons | `GET/POST /persons`, `DELETE /persons/{id}`, `POST /persons/{id}/resend`, `POST /persons/{id}/verify-key` | FR-OWN-06, FR-INV-02, FR-INV-06, FR-INV-07, FR-CRY-11 |
| Activation | `GET/PUT /activation/settings`, `GET /activation`, `POST /activation/cancel`, `GET /activation/history` | FR-ACT-01…06, FR-ACT-10, FR-ACT-13, FR-NOT-09 |
| SMS check-in | `POST /checkins/{token}/answer` | FR-ACT-16, FR-NOT-02, FR-NOT-03 |
| Mini App | `POST /mini/invitations/{token}/accept`, `POST /mini/key-check`, `GET/POST/DELETE /mini/confirmations/{ownerId}`, `GET /mini/capsules`, `GET /mini/capsules/{id}` | FR-INV-05, FR-INV-08, FR-CRY-03a, FR-CRY-06, FR-CRY-07, FR-CRY-10, FR-ACT-08, FR-ACT-12, FR-TRU-08 |
| Telegram | `POST /telegram/webhook` | FR-INV-04, FR-INV-05 |

## Example flow: from setup to release

1. **Owner registers.** The browser derives the encryption key and the authentication key from the master password (Argon2id + HKDF) and sends only the authentication key, the public key and the private key encrypted on the device (`POST /auth/register`).
2. **Owner adds a trusted person** (`POST /persons`). The server sends the SMS invitation. The trusted person opens the bot, shares the phone number, gives consent, and the Mini App generates a key pair in SecureStorage and sends only the public key (`POST /mini/invitations/{token}/accept`).
3. **Owner compares safety codes** with the trusted person by phone and marks the key as verified (`POST /persons/{id}/verify-key`).
4. **Owner creates a capsule.** The browser encrypts the content with a random capsule key (`PUT /capsules/{id}/content`), splits the key into shares and seals each share with a trusted person's public key (`PUT /capsules/{id}/shares`):
   ```json
   { "k": 2, "n": 3, "scheme": "shamir",
     "shares": [ { "trustedPersonId": "p-11aa", "sealedShare": "base64:Wc0F…" }, … ] }
   ```
5. **The owner stops answering.** After the final check-in the state becomes AWAITING CONFIRMATION and trusted persons are notified.
6. **A trusted person confirms.** The Mini App downloads the share sealed for this person (`GET /mini/confirmations/{ownerId}`), opens it with the key from SecureStorage and seals it again for each recipient (`POST /mini/confirmations/{ownerId}`):
   ```json
   { "confirmed": true,
     "reencryptedShares": [ { "capsuleId": "c-19a2", "recipientId": "p-04b1", "sealedShare": "base64:Qm9y…" } ] }
   ```
   The response does not tell the trusted person how many others have confirmed (FR-TRU-02).
7. **Release.** After *k* confirmations and the waiting period, the recipient's Mini App gets the ciphertext and *k* shares sealed for the recipient (`GET /mini/capsules/{id}`), reconstructs the capsule key and decrypts the content on the phone.

## What the server sees at each step

| Step | Server receives | Server never receives |
|---|---|---|
| Registration and login | Email, authentication key, public key, encrypted private key | Master password, encryption key, private key |
| Capsule creation | Encrypted title, ciphertext, sealed shares | Content, capsule key, plain shares |
| Invitation | Name, phone number (deleted after decline, FR-INV-08), public key of the invited person | Private key of the invited person |
| Confirmation | Shares sealed for recipients | Plain shares |
| Release | Nothing new; only delivers ciphertext and sealed shares | Capsule key, content |

## Open points for the implementation

- Argon2id parameters are placeholders until they are measured on phones (NFR-PERF-02).
- The format of the ciphertext (IV, tag and version byte) and the HKDF context labels are fixed in the protocol specification.
- Error codes and pagination will be completed when the backend is implemented.
