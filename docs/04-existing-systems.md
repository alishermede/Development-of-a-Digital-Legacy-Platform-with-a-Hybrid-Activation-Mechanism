# 4. Existing System Comparison

This section compares five existing tools that pass a person's digital data to other people after death or long inactivity. The aim is to see what each tool covers, what it leaves open, and where the Digital Legacy Platform can do something different. Every statement comes from a source listed at the end, read on 22.10.2026.

| Section | Responsible |
|---|---|
| 4.1 Systems and criteria, 4.2 Comparison table, 4.3 Reading the table, 4.4 Gap, 4.5 Limitations | Aibyn Samat (DIP-10) |
| Verification of the cryptographic criteria (rows 3 and 6 of the table) | Alisher Medebaev (DIP-11) |

## 4.1 Systems and criteria

The five systems are Google Inactive Account Manager, Apple Legacy Contact, Bitwarden Emergency Access, Cipherwill and Just In Case. They fall into three groups. Google and Apple work only inside their own accounts. Bitwarden is a password manager with a built-in handover. Cipherwill and Just In Case were built only for digital legacy.

The ten criteria come from the proposal (`docs/01-proposal.md`) and the requirements (`docs/06-requirements.md`). Each one is a decision the platform has to make for itself: what starts the release, how many people must agree, whether the key is split, whether there is a waiting period the owner can stop, how the owner is checked on, who can read the data, what the receiver needs, what can be passed on, what it costs and which languages it speaks. The criteria are the same for every system. Where a source says nothing, the cell says "not stated" and nothing is guessed.

The name "Just In Case" belongs to several products. This section uses the iOS app "Just In Case: Digital Legacy" from the App Store. It is not the will-writing site Just In Case Estates and not LegacyApp. Everything about it comes from the store listing, so it is the developer's own description and not an independent source.

## 4.2 Comparison table

| Criterion | Google Inactive Account Manager | Apple Legacy Contact | Bitwarden Emergency Access | Cipherwill | Just In Case |
|---|---|---|---|---|---|
| 1. What starts the release | The whole Google Account is inactive for 3, 6, 12 or 18 months [1][2] | A contact files a request with the access key and the death certificate [4][5] | The trusted contact asks for access; nothing starts automatically [9] | No login for the chosen interval, 3 months by default, from weekly to annual [14] | Inactivity, then a five-level chain: email, SMS, AI phone call, cooling period, delivery [18] |
| 2. Confirmation by several people (FR-ACT-04, FR-ACT-08) | No. Up to 10 contacts are notified and each gets the download link [2] | No. Any one Legacy Contact can decide alone, including deleting the data [4] | No. One contact is enough; the number of contacts is not limited [9] | No confirmation by people found; release follows the timeline [14] | Not stated [18] |
| 3. Key split between trustees (FR-CRY-04) | No. The provider holds the data (see row 6) | Partly. The key is split into two parts: Apple stores an encrypted packet and the contact keeps an AES key; neither part alone reveals the key. This is a two-party split between the provider and one contact, not *k* of *n* trusted persons, and the contact's part does not include the iCloud Keychain key [4][20] | No. The grantor's User Symmetric Key is encrypted with each grantee's RSA public key separately, so the whole key goes to one contact [9] | Not described. The home page mentions "pre-sharded contingency decryption keys" without saying how they are created or who holds the shards, and does not mention Shamir's scheme [13]; the documentation describes a time-capsule key plus the beneficiary's public key and a timelock based on public random beacons [15] | Not stated [18] |
| 4. Waiting period the owner can stop (FR-ACT-05, FR-ACT-10) | No separate period. The inactivity time is the delay; the owner can edit or turn off the plan [1]; contacts have 3 months to download [2] | No waiting period. The only delay is Apple's review of the request [4][6]; the owner can remove a contact while alive [7] | Yes. Wait time is set per contact, at least one day; the owner can approve or reject at any moment, and access opens by itself when the time ends [9][10] | Reminders at day 3, 30 and 90, key release at day 100 by default; any activity resets the countdown [14] | A "cooling period" is level 4 of the chain; its length and how to cancel are not stated [18] |
| 5. Owner check-ins and channels (FR-ACT-02, FR-ACT-03) | No separate check-in; activity in Google services counts as presence [1] | None described [4] | None. The owner gets an email when the contact asks [9] | Yes. Free plan: email only; Premium adds calls, SMS and WhatsApp [13][14] | Yes. Email, SMS and an AI phone call [18] |
| 6. Provider can read the data (NFR-SEC-01) | Yes, by the look of it: Google sends the chosen data itself, so it holds it in readable form (my inference from [2]) | By default yes. End-to-end encryption needs the optional Advanced Data Protection, and Mail, Contacts and Calendar are never covered [8]; how Legacy Contact access works together with Advanced Data Protection is not described in the security guide [20] | No. Zero-knowledge; the vault key reaches the contact encrypted with their public key [9] | No, as claimed: two layers, a time-capsule key in the browser (AES-256-GCM) and the beneficiary's public key (ECDH on secp256k1) [15]. "Independently third-party audited" is claimed without naming the auditor [13] | No, as claimed by the developer: AES-256-GCM, SRP-6a login [18]. Not verified |
| 7. What the receiver needs (FR-INV-01) | An email with a download link; whether a Google account is needed is not stated [2] | No Apple Account or Apple device is needed to file the request; after approval the contact gets a special Apple Account [4][5] | A Bitwarden account on the same server [9] | A beneficiary dashboard; registration is not stated [13] | Not stated [18] |
| 8. What can be passed on | Chosen data of Google services only [2] | iCloud data. Not Keychain passwords, purchases or payment data [6] | The whole vault, including passwords and attachments [9] | Passwords, seed phrases, notes, files up to 1 GB on Premium [13] | Passwords, documents, crypto keys, notes [18] |
| 9. Price | No fee stated [1] | No fee stated [4] | The owner needs Premium, $19.80 a year [9][12]; the contact can use a free account [9] | Free for 5 beneficiaries; Premium $40 a year [13] | Free in the App Store; in-app purchases not checked [17] |
| 10. Kazakh and Russian interface (NFR-L10N-01) | The Google Account offers both [3]; the Inactive Account Manager page itself was not checked | Russian support pages exist [7]; Kazakh not found | Russian yes, Kazakh no [11] | English only according to a third-party listing [16] | English only [17] |

## 4.3 Reading the table

Google and Apple fit the person who keeps everything inside one ecosystem. In both, one company holds the data and one contact is enough. Google starts on inactivity and mails a download link to every contact on the list. Apple starts on a death certificate and an access key, and any single Legacy Contact can even delete the data permanently. Neither passes on passwords for other services; Apple states this for the Keychain explicitly. Neither asks the owner whether they are still around before releasing anything.

Bitwarden is the closest in cryptography and in the waiting period. The vault stays unreadable for the provider, and the owner can reject a request during a wait time of at least one day. Three things still limit it. The owner has to pay for Premium, the contact needs a Bitwarden account, and nothing checks on the owner: the process starts when a contact asks. My reading is that one contact who asks while the owner is on a long trip without email ends up with the whole vault, because nobody else has to agree.

Cipherwill and Just In Case went the other way. They check on the owner with email, SMS or phone calls and encrypt on the device, but the release depends on silence alone. A long holiday, a lost phone or a broken laptop look the same to the timer as a death, and no second person is asked. Cipherwill softens this with a long timeline, 100 days by default, and Just In Case with a cooling period, but in both cases the owner is the only safeguard. Cipherwill's SMS and phone check-ins sit behind the paid plan. Just In Case is a young app by one developer, and none of its security claims could be confirmed.

One more product points the same way. LegacyApp lets the owner add Trusted Friends, and access opens as soon as at least one of them confirms [19]. That is closer to the idea of human confirmation, but it is still one person, not *k* of *n*.

## 4.4 Gap

In the sources read for this section, none of the five combines the three things the proposal builds on: confirmation by several independent people, a waiting period the owner can stop, and data the provider cannot read. Each has at most two of them. Bitwarden has the waiting period and the zero-knowledge property but needs only one contact. Cipherwill and Just In Case have zero-knowledge claims and check-ins but no human confirmation. Google and Apple have a single contact or inactivity as the trigger and a provider that can read the data. A false release is therefore only guarded by the owner's own reaction, and a malicious or mistaken single contact or timer is enough to start it.

The second gap is local. None of the five offers a Kazakh interface, and Russian is available only in the large ecosystems and in Bitwarden. None of them mentions Kazakhstan inheritance or personal data rules. The proposal's claim that no such service is localized for Kazakhstan holds for these five.

This is the gap the Digital Legacy Platform targets: missed check-ins start the process, *k* of *n* trusted persons must confirm with key shares split by Shamir's scheme, the owner can cancel during the waiting period, and the server stores only ciphertext. It adds a Kazakh and Russian interface and works for trusted persons and recipients without registration through Telegram.

## 4.5 Limitations

The cryptographic rows (3 and 6) rest on vendor documentation and marketing pages. Claims marked "as claimed" were not tested; they were checked against the vendors' security documentation in DIP-11 (section 4.6). The statement that Google can read the data is my inference from how the feature works, not a quote from Google. The Google security blog post dates from 2021, so the current settings screen should be rechecked before the defense. The Bitwarden price comes from press coverage of its January 2026 change, not from a plan page. The row for Just In Case comes only from the App Store listing. Prices and plans were read on 22.10.2026 and can change.

## 4.6 Verification of the cryptographic criteria (DIP-11)

Rows 3 and 6 were checked on 22.10.2026 against the vendors' own security documentation rather than marketing pages.

| System | Source checked | Result |
|---|---|---|
| Google Inactive Account Manager | Help page [1] | No security description is published; row 6 remains an inference from how the feature works |
| Apple Legacy Contact | Apple Platform Security guide [20] | Row 3 corrected: the access key is split between Apple and the contact (two parts, both needed), not shared among several people. Row 6 refined: the guide does not say how Legacy Contact access interacts with Advanced Data Protection |
| Bitwarden Emergency Access | Help page on the emergency access flow [9] | Confirmed: the User Symmetric Key is wrapped with each grantee's RSA public key; no key splitting; zero-knowledge as described |
| Cipherwill | Cascade encryption page [15], home page [13] | Confirmed that splitting is not described; refined with the two encryption layers and the timelock; the audit claim names no auditor |
| Just In Case | App Store description [18] | No technical documentation exists beyond the store listing; row 6 stays "as claimed" |

The comparison in section 4.4 is unchanged and becomes more precise: even the system with a split key (Apple) divides it between the provider and a single contact, while none of the five requires several independent people to confirm the event.

## References

1. Google, "About Inactive Account Manager" (accessed 22.10.2026). https://support.google.com/accounts/answer/3036546?hl=en
2. Google Security Blog, "Google Protects Your Accounts – Even When You No Longer Use Them", 5 October 2021 (accessed 22.10.2026). https://security.googleblog.com/2021/10/google-protects-your-accounts-even-when.html
3. Google, account sign-up page with the list of interface languages (accessed 22.10.2026). https://accounts.google.com/SignUp?hl=lv
4. Apple, "How to add a Legacy Contact for your Apple Account" (accessed 22.10.2026). https://support.apple.com/102631
5. Apple, "Request access to an Apple Account as a Legacy Contact" (accessed 22.10.2026). https://support.apple.com/en-gb/102678
6. Apple, "Data that a Legacy Contact can access", published 16 April 2026 (accessed 22.10.2026). https://support.apple.com/en-sg/103128
7. Apple, "Remove a Legacy Contact from your Apple Account", Russian-language support page (accessed 22.10.2026). https://support.apple.com/ru-ru/126507
8. BleepingComputer, "Apple rolls out end-to-end encryption for iCloud backups" (accessed 22.10.2026). https://www.bleepingcomputer.com/news/apple/apple-rolls-out-end-to-end-encryption-for-icloud-backups/
9. Bitwarden, "About Emergency Access" (accessed 22.10.2026). https://bitwarden.com/help/emergency-access/
10. Bitwarden, "Add & Manage Trusted Emergency Contacts" (accessed 22.10.2026). https://bitwarden.com/help/add-and-manage-trusted-emergency-contacts/
11. Bitwarden, "Localization" (accessed 22.10.2026). https://bitwarden.com/help/localization/
12. AlternativeTo, "Bitwarden enhances Premium and Families plans with more security features & raises prices", January 2026 (accessed 22.10.2026). https://alternativeto.net/news/2026/1/bitwarden-enhances-premium-and-families-plans-with-more-security-features-and-raises-prices/
13. Cipherwill, home page with plans and security overview (accessed 22.10.2026). https://www.cipherwill.com/
14. Cipherwill, "Will Execution Timeline" (accessed 22.10.2026). https://www.cipherwill.com/i/how-execution-timeline-works
15. Cipherwill, "Cascade Encryption" (accessed 22.10.2026). https://www.cipherwill.com/i/cascade-encryption
16. Software Finder, "Cipherwill", third-party listing (accessed 22.10.2026). https://softwarefinder.com/legal/cipherwill
17. App Store (US), "Just In Case: Digital Legacy", listing with price and language (accessed 22.10.2026). https://apps.apple.com/us/app/just-in-case-digital-legacy/id6759258331
18. App Store (CA), "Just In Case: Digital Legacy", developer description (accessed 22.10.2026). https://apps.apple.com/ca/app/just-in-case-digital-legacy/id6759258331
19. LegacyApp, "How are my notes in LegacyApp passed to my Beneficiary?" (accessed 22.10.2026). https://legacy.app/en/help-center/how-are-my-notes-in-legacyapp-passed-to-my-beneficiary
20. Apple, "Legacy Contact security", Apple Platform Security guide (accessed 22.10.2026). https://support.apple.com/guide/security/secebf027fb8/web
