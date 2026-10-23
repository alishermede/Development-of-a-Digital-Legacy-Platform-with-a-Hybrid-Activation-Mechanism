# 3. Literature Review

This section reviews the literature behind the Digital Legacy Platform. It covers secret sharing, key derivation, zero-knowledge encryption, recovery protocols and dead man's switches (DIP-7), then digital legacy, usable security and the law of Kazakhstan (DIP-8). The last parts compare the approaches, state the research gap and list the limits of the review (DIP-9). Web sources were accessed on 22.10.2026, and section 3.7 says which sources were read only in part or not rechecked.

| Section | Responsible |
|---|---|
| 3.1 Scope and selection, 3.2 Cryptography and activation protocols (DIP-7) | Aibyn Samat |
| 3.3 Digital legacy, usable security, Kazakhstan law (DIP-8) | Aibyn Samat |
| 3.4 Analysis table, 3.5 Comparison of approaches, 3.6 Research gap, 3.7 Limitations (DIP-9) | Aibyn Samat |

## 3.1 Scope and selection

The review has 20 sources: 16 scientific works (peer-reviewed papers, book chapters, a dissertation and preprints), 2 standards and 2 legal texts. Eighteen of the 20 are not legal texts. Nine of those 18 were published in 2021 or later, and the rest are foundational works (Shamir 1979, the Argon2 paper) or standards that are still in force. Sources were chosen when they bear on a decision already written into the proposal or the requirements, and the table in section 3.4 names the requirement each one touches. Legal sources are official texts of the Republic of Kazakhstan. Sources are cited in IEEE style and numbered in the order they first appear.

Searches were conducted in English and Russian. No scientific source in Kazakh was found, which is noted in section 3.7.

## 3.2 Cryptography and activation protocols

### 3.2.1 Secret sharing

Shamir's scheme [1] hides a secret as the constant term of a random polynomial of degree k−1 over a finite field. Each share is one point on the polynomial. Any k points fix the polynomial and reveal the secret, while k−1 points leave every possible secret equally likely. The guarantee holds against an attacker with unlimited computing power, which is why the proposal builds on it. Two limits matter for us. The dealer, here the owner's browser, must be honest and bug free, because a share cannot be checked against the secret it came from. And with k = 1 the polynomial is a constant, so splitting does nothing, which is the reason FR-CRY-04 handles k = 1 by encrypting the capsule key separately for each trusted person.

Beimel's survey [2] covers schemes for access structures more general than "any k of n". As the survey describes, general structures need much larger shares than a plain threshold, where each share can be as small as the secret itself. The platform needs only the threshold case, so this cost does not apply, and a rule such as "two relatives, or one relative and a lawyer" is out of scope for the same reason.

Herzberg et al. [3] address a different problem: shares that stay in place for years while an attacker slowly breaks into shareholders one by one. Their proactive scheme refreshes all shares periodically without ever rebuilding the secret, so the attacker needs k shares inside a single period. The refresh is an interactive protocol between the shareholders. Our trusted persons are relatives with a Telegram account, and asking them to run a protocol together is unrealistic. FR-CRY-08 takes the simpler route: the owner re-splits the key and issues new shares. That route works only while the owner is alive and active, so a share stolen after the process has started cannot be refreshed. The threat model has to say this openly.

### 3.2.2 Key derivation and authenticated encryption

The Argon2 paper [4] describes a memory-hard function, the winner of the Password Hashing Competition, designed so that a large amount of memory slows down cracking on GPUs and custom hardware. RFC 9106 [5] turns it into a standard and recommends the Argon2id variant as the default for password hashing. This is the function the owner's master password goes through (FR-CRY-02). The RFC lists parameter sets for different memory budgets. The large set is not realistic for a phone browser, so final values will be chosen by measurement against NFR-PERF-02 (2 s on a mid-range smartphone) and written down. Memory hardness raises the price of each guess and does nothing for a weak password, so the interface still has to push the owner toward a strong one.

NIST SP 800-38D [6] specifies AES-GCM, the mode used for capsules (FR-CRY-01). The standard requires a unique initialization vector for every encryption under one key and limits how many encryptions one key may protect when the vectors are random. A fresh 256-bit key per capsule keeps the platform far from that limit. The one place to watch is editing: FR-OWN-05 says an edit creates new ciphertext, and if that happens under the same capsule key, the vector must be new each time.

### 3.2.3 What zero-knowledge claims are worth

Scarlata et al. [7] tested the "zero-knowledge encryption" claim of three cloud password managers against a fully malicious server. They report 12 attacks on Bitwarden, 7 on LastPass and 6 on Dashlane, and most of them recover passwords. The attacks fall into four groups: abuse of key escrow used for account recovery and single sign-on, missing integrity of the vault as a whole, flaws in the sharing features, and old cryptographic code kept for backward compatibility. The paper concerns password managers, so it does not say our protocol is broken. It does show where systems of the same kind failed, and three of the four groups touch our design directly: recovery (FR-CRY-09), sharing between people (FR-CRY-05, FR-CRY-06) and integrity of stored ciphertext (FR-CRY-01).

Applied to our case, a malicious server could hand the owner's browser a wrong public key for a trusted person and so receive a share it can decrypt. FR-INV-05 checks the person's phone number, but the requirements do not say how the owner's browser learns that the public key it encrypts to really belongs to that person. This remains an open point for the threat model (NFR-SEC-03) and for the verification plan (DIP-21), inferred from the attack classes.

### 3.2.4 Recovery by trusted people, and the waiting period

Guardian-based recovery in Web3 wallets is the closest working analogue of the *k*-of-*n* confirmation and the cancellable waiting period. The wallet owner names guardians, a threshold of them can approve a change of key, and the change takes effect only after a delay in which the owner can object. Chatzigiannis et al. [8] systematize such recovery mechanisms, and the same group's later paper [9] gives a framework for analysing how recovery mechanisms combine; later work cites it for the choice of the delay parameter.

The analogy is useful and has a limit. In a wallet the delay is a window for the living owner to veto a wrong recovery, and the tension is always the same: the delay must be long enough for the owner to notice and short enough for a real recovery to be useful. Our waiting period (FR-ACT-05, 7 days by default) has the same tension. The difference is who is absent. Wallet guardians act when the key is lost, while our trusted persons act when the owner may be dead, so a missing veto is the expected outcome and not a warning sign. This is why FR-ACT-16 forbids the SMS check-in link from stopping a running waiting period: otherwise anyone holding the owner's phone could stop a real activation.

### 3.2.5 Dead man's switch

Banerjee et al. [10] treat the dead man's switch as a cryptographic primitive for the first time, by their own statement. They define two modes, release and delete, prove the construction in the universal composability framework and build it on proactive secret sharing with a changing committee of holders. Release goes to designated recipients through a public key infrastructure and multi-recipient encryption. This is the nearest formal work to the platform's aim. Two things limit its use for us. It is a preprint on ePrint. Its abstract describes how the secret is kept and released but does not detail how the death of the keeper is established or whether it addresses false triggers. The platform's contribution is exactly that part, the human confirmation and the cancellable delay.

### 3.2.6 Recovery codes in practice

Höltervennhoff et al. [11] surveyed 281 users of an end-to-end encrypted email service and analysed 197 support requests. Most participants kept the recovery code and found six ways to store it, the commonest being a password manager. They valued the security of the code and found its usability poor: codes were lost, some did not work, and users held misconceptions, for example that the provider could restore their data. This bears on FR-CRY-09, where the owner's recovery key is shown once and may be printed, and on NFR-USE-03, which asks that encryption be explained in plain language. The study covers one email provider and self-selected users, so the percentages should not be carried over to our owners.

## 3.3 Digital legacy, usable security and Kazakhstan law

### 3.3.1 Digital legacy as a research topic

Brubaker et al. [12] interviewed 20 people who had lost someone and managed their online accounts afterwards. They argue that managing a dead person's data is closer to stewardship than to inheritance: the people who handle it carry responsibilities and relationships, and there is no single owner to hand things to. The study is about social network accounts, mostly Facebook, and it describes the people who stayed behind, not those who plan ahead.

Holt et al. [13] ran two workshops with users of password managers and found what they call a post-mortem privacy paradox. People see the value of planning and avoid doing it. The security habits recommended in life, such as a strong master password known only to oneself, work against giving anyone access after death. The authors recommend designs that encourage planning while keeping those habits. The sample is small and the workshops were held in the United Kingdom, so the paradox is a hypothesis for our interviews and not a settled fact. It supports the proposal's main choice: access after death should not depend on telling someone the master password.

Edwards and Harbinja [14] argue from the legal side that the privacy interests of the deceased deserve recognition. The article is built on United States and United Kingdom law. For us it supports one design point, that capsule content should stay unreadable to everyone, including the provider, until the release.

### 3.3.2 Usable security

Whitten and Tygar [15] tested whether people could use PGP 5.0 and found that the interface did not match what users understood about public and private keys. The system is old and the test was small. The result still applies to a product where a relative has to hold a private key without knowing what one is. FR-TRU-10 (a help section of at most 3 short screens) and NFR-USE-05 (accept in 5 taps, confirm in 3 steps) answer this directly.

The System Usability Scale [16] is a ten-item questionnaire that gives one score from 0 to 100. The project uses it for the target of NFR-USE-01 (SUS of at least 70). The scale measures overall impression, so it cannot show which screen is the problem. The usability plan (DIP-22) therefore adds task success and time on task.

### 3.3.3 Law of Kazakhstan

The Civil Code, Special Part [19], regulates inheritance in section 6. Article 1040 says the estate consists of the property of the deceased and of rights and obligations that do not end with death. Rights and obligations inseparable from the person are excluded. A capsule is not a will and does not transfer property, which matches the out-of-scope list in the proposal. The reviewed sources do not settle whether an online account is part of the estate. Zakirov and Khayarova [18] state, for Russian law, that civil legislation does not regulate the legal regime of an account, and Russian law is not Kazakh law, so this point serves only as a sign that the question is open in neighbouring systems. Zhanabilova's dissertation [17] has a chapter on the regulation of digital assets in Kazakhstan and one on inheriting particular kinds of them. A careful reading is still needed before the proposal says anything about the legal status of accounts.

The Law on Personal Data and Their Protection [20] says in Article 12 that personal data is stored by the owner, the operator or a third party in a database located in the territory of Kazakhstan. The platform stores the names and phone numbers of trusted persons and recipients, so this applies to those fields. NFR-LAW-01 is a Should requirement, and given the text of the article it may need to be a Must for the stored personal data; this is raised for the supervisor and for the risk register. Two further questions are not answered by the sources I read: whether the owner may enter a trusted person's phone number before that person has agreed, and how the transfer of a number to an SMS provider or to the email provider outside Kazakhstan is treated (section 5.7.2 already notes the email case). Both require a legal opinion and remain unanswered here. Prg.kz shows the text of the law as amended on 12.07.2026; the current edition must be checked on adilet.zan.kz before the defense.

## 3.4 Analysis table

| # | Source | Type, year | Finding relevant to the project | Limitation | Requirements |
|---|---|---|---|---|---|
| 1 | Shamir [1] | Paper, 1979 | k of n shares rebuild a secret; k−1 reveal nothing, even to an unlimited attacker | Honest dealer assumed; shares cannot be verified; k = 1 is degenerate | FR-CRY-04, FR-ACT-04 |
| 2 | Beimel [2] | Survey chapter, 2011 | General access structures cost much more than a threshold | General survey; no implementation advice | FR-CRY-04 |
| 3 | Herzberg et al. [3] | Paper, 1995 | Periodic share refresh defeats a slow, gradual attacker | Needs interaction between shareholders | FR-CRY-08, NFR-SEC-03 |
| 4 | Biryukov et al. [4] | Paper, 2016 | Memory-hard function for password hashing | Memory hardness does not help weak passwords | FR-CRY-02, NFR-PERF-02 |
| 5 | RFC 9106 [5] | Standard, 2021 | Argon2id recommended as the default; parameter sets given | Large memory sets unrealistic on phones | FR-CRY-02, NFR-PERF-02 |
| 6 | NIST SP 800-38D [6] | Standard, 2007 | GCM needs a unique initialization vector per encryption | Does not cover key management | FR-CRY-01, FR-OWN-05 |
| 7 | Scarlata et al. [7] | Paper, 2026 | Zero-knowledge claims failed against a malicious server in all three managers tested | Password managers, not legacy services | NFR-SEC-01, NFR-SEC-03, FR-CRY-05, FR-CRY-09 |
| 8 | Chatzigiannis et al. [8] | Preprint (SoK), 2023 | Systematizes guardian and delay based recovery | Preprint (SoK) | FR-ACT-08, FR-ACT-10 |
| 9 | Chatzigiannis et al. [9] | Paper, 2025 | Framework for analysing wallet recovery, including the delay | Blockchain wallets | FR-ACT-05 |
| 10 | Banerjee et al. [10] | Preprint, 2026 | Formal dead man's switch with release and delete modes | Preprint; trigger mechanism not fully described | FR-ACT-06, FR-ACT-08 |
| 11 | Höltervennhoff et al. [11] | Paper, 2024 | Recovery codes are valued for security and weak in usability | One email provider; self-selected users | FR-CRY-09, NFR-USE-03 |
| 12 | Brubaker et al. [12] | Paper, 2014 | Post-mortem data handling is stewardship, with responsibilities and relationships | Social network accounts; bereaved people, not planners | FR-OWN-02, FR-OWN-03 |
| 13 | Holt et al. [13] | Paper, 2021 | People value legacy planning and avoid it; life-time security habits conflict with post-mortem access | Two workshops, United Kingdom | FR-OWN-02, NFR-USE-04 |
| 14 | Edwards and Harbinja [14] | Law article, 2013 | The deceased have privacy interests worth protecting | United States and United Kingdom law | NFR-SEC-01 |
| 15 | Whitten and Tygar [15] | Paper, 1999 | Key concepts confuse users of public key tools | Old system, small test | FR-TRU-10, NFR-USE-05 |
| 16 | Brooke [16] | Chapter, 1996 | Ten-item scale giving one usability score | One overall score, no diagnosis | NFR-USE-01 |
| 17 | Zhanabilova [17] | Dissertation, 2025 | Covers digital asset regulation and inheritance, including Kazakhstan | Extensive document, specific chapters apply | proposal scope, risk register |
| 18 | Zakirov and Khayarova [18] | Paper, 2023 | Civil legislation does not regulate the regime of a social network account (Russian law) | Russian law, not Kazakh | proposal scope |
| 19 | Civil Code, Special Part [19] | Law, current edition | Estate includes rights that outlive the person; capsule is not a will | Article text checked through secondary pages | proposal scope |
| 20 | Law on Personal Data [20] | Law, current edition | Personal data is stored in a database located in Kazakhstan | Edition to be rechecked on adilet.zan.kz | NFR-LAW-01 |

## 3.5 Comparison of approaches

### Who decides that the event happened

The sources and the systems in section 4 give four answers. A timer alone is the plainest dead man's switch, and the formal treatment [10] and the tools in section 4 (Cipherwill, Just In Case) follow it. Its weakness is the one in the proposal: a long holiday looks the same as a death. One contact deciding alone is the Bitwarden model and, in practice, Google's and Apple's, and the whole safeguard is that single person. Guardian recovery [8][9] asks a threshold of people, but in wallets the guardians help a living owner who has lost a key, so the question "is the owner dead" never comes up. Our design joins the timer and the threshold: silence only starts the process, and release needs k confirmations and an unchallenged waiting period. No source was found that evaluates this combination for ordinary people, and the evaluation in DIP-21 against a simple dead man's switch is meant to supply that evidence.

### Where trust sits

The password manager study [7] shows that a vendor's statement about zero knowledge says little about a malicious server. Its attack classes are the ones a legacy platform has too, because recovery, sharing and stored ciphertext all exist there. The platform's answer is to keep every private key off the server (FR-CRY-03, FR-CRY-03a) and to verify tamper-evidence through AES-GCM tags (FR-CRY-01). What stays open is how a public key is authenticated, as described in 3.2.3.

### How shares are kept and renewed

Dealer-based Shamir sharing [1] is simple, runs once in the owner's browser and needs nothing from the shareholders. Proactive and evolving-committee schemes [3][10] hold up better over decades and need shareholders that stay online and cooperate. For relatives with a Telegram account the dealer-based choice is the realistic one. Its price is that shares go stale when a phone is lost, which the platform meets with periodic key checks (FR-CRY-10) and re-splitting (FR-CRY-08), both of which need the owner. If the owner has died and a trusted person's phone is lost, the remaining trusted persons must still reach k, so *n* greater than *k* is the only protection. FR-OWN-13 already recommends it.

### Recovery for the owner

Recovery codes [11] work for a single user who keeps one secret in one place. Trusted-person recovery [8][9] spreads the risk but adds people the owner must trust. The platform uses a recovery key for the owner (FR-CRY-09, a Should requirement) and the trusted persons only for release. The study's findings on lost and non-working codes suggest the recovery key should be tested at registration, for example by asking the owner to enter part of it. This is proposed for the owner's wizard (NFR-USE-04); it is a suggestion and not something the study evaluated.

## 3.6 Research gap and how the project addresses it

In the reviewed sources, three things are missing together.

First, no work evaluates a consumer digital legacy service that combines check-ins, confirmation by several independent people and a cancellable waiting period. The closest formal work [10] handles the cryptography of release and deletion, and the closest working designs [8][9] handle guardians and delay for wallets. The platform's activation state machine (FR-ACT-06) and its evaluation against a dead man's switch baseline (objective 7 in the proposal) address this.

Second, there is little usable security evidence for people who hold a key without an account. The usability studies [11][13][15] concern users who sign up for a service, or planners with a password manager. Trusted persons and recipients here have no registration, and their keys sit in Telegram SecureStorage on a phone (CON-02, CON-03). The SUS target and the task tests in DIP-22 will give first data, with the caveat that five participants are a small sample.

Third, no scientific work was found on digital legacy tools for Kazakhstan, in either Russian or Kazakh, and the legal sources do not answer how accounts and personal data of third parties are treated. The proposal already limits the scope to a technical transfer of data and not a legal transfer of property, and the legal questions in 3.3.3 go to the supervisor and into the risk register (DIP-23).

## 3.7 Limitations of this review

Search engines and publisher pages were used to select sources that bear on decisions already in the proposal, so important work may be missing, especially in the older literature on timed release and on legacy services.

Two sources, [8] and [10], are preprints. Source [10] is from 2026 and has had little time to be tested. The papers on usability [11][13] come from Germany and the United Kingdom, and their users may differ from users in Kazakhstan. No source in Kazakh was found, and the Russian scholarship [17][18] is on Russian law with Kazakh material only in part. No court practice of Kazakhstan was reviewed.

## References

1. A. Shamir, "How to share a secret," *Commun. ACM*, vol. 22, no. 11, pp. 612–613, Nov. 1979, doi: 10.1145/359168.359176.
2. A. Beimel, "Secret-sharing schemes: A survey," in *Coding and Cryptology (IWCC 2011)*, Lecture Notes in Computer Science, vol. 6639. Berlin, Germany: Springer, 2011, pp. 11–46.
3. A. Herzberg, S. Jarecki, H. Krawczyk, and M. Yung, "Proactive secret sharing or: How to cope with perpetual leakage," in *Advances in Cryptology – CRYPTO '95*, Lecture Notes in Computer Science, vol. 963. Berlin, Germany: Springer, 1995, pp. 339–352.
4. A. Biryukov, D. Dinu, and D. Khovratovich, "Argon2: New generation of memory-hard functions for password hashing and other applications," in *Proc. IEEE Eur. Symp. Security and Privacy (EuroS&P)*, 2016, pp. 292–302, doi: 10.1109/EuroSP.2016.31.
5. A. Biryukov, D. Dinu, D. Khovratovich, and S. Josefsson, "Argon2 memory-hard function for password hashing and proof-of-work applications," IETF, RFC 9106, Sep. 2021. [Online]. Available: https://www.rfc-editor.org/info/rfc9106 (accessed 22.10.2026).
6. M. Dworkin, "Recommendation for block cipher modes of operation: Galois/Counter Mode (GCM) and GMAC," NIST, Gaithersburg, MD, USA, Spec. Publ. 800-38D, Nov. 2007.
7. M. Scarlata, G. Torrisi, M. Backendal, and K. G. Paterson, "Zero knowledge (about) encryption: A comparative security analysis of three cloud-based password managers," in *Proc. 35th USENIX Security Symp.*, Philadelphia, PA, USA, USENIX Association, Aug. 2026. Full version: IACR Cryptol. ePrint Arch., Paper 2026/058. [Online]. Available: https://eprint.iacr.org/2026/058 (accessed 22.10.2026).
8. P. Chatzigiannis, K. Chalkias, A. Kate, E. V. Mangipudi, M. Minaei, and M. Mondal, "SoK: Web3 recovery mechanisms," IACR Cryptol. ePrint Arch., Paper 2023/1575, 2023. [Online]. Available: https://eprint.iacr.org/2023/1575 (accessed 22.10.2026).
9. P. Chatzigiannis, K. C. Wang, S. S. Arora, and M. Minaei, "A composability analysis framework for Web3 wallet recovery mechanisms," in *Proc. IEEE Symp. Security and Privacy (SP)*, San Francisco, CA, USA, IEEE, May 2025, pp. 1531–1546, doi: 10.1109/SP61157.2025.00158.
10. S. Banerjee, A. Bozhko, R. Heitjohann, and A. Rupp, "Dead man's switch cryptography," IACR Cryptol. ePrint Arch., Paper 2026/1352, 2026. [Online]. Available: https://eprint.iacr.org/2026/1352 (accessed 22.10.2026).
11. S. Höltervennhoff, N. Wöhler, A. Möhle, M. Oltrogge, Y. Acar, O. Wiese, and S. Fahl, "A mixed-methods study on user experiences and challenges of recovery codes for an end-to-end encrypted service," in *Proc. 33rd USENIX Security Symp.*, Philadelphia, PA, USA, 2024, pp. 7267–7284. [Online]. Available: https://www.usenix.org/conference/usenixsecurity24/presentation/h%C3%B6ltervennhoff (accessed 22.10.2026).
12. J. R. Brubaker, L. S. Dombrowski, A. M. Gilbert, N. Kusumakaulika, and G. R. Hayes, "Stewarding a legacy: Responsibilities and relationships in the management of post-mortem data," in *Proc. SIGCHI Conf. Human Factors in Computing Systems (CHI '14)*, Toronto, ON, Canada, 2014, pp. 4157–4166.
13. J. Holt, J. Nicholson, and J. D. Smeddinck, "From personal data to digital legacy: Exploring conflicts in the sharing, security and privacy of post-mortem data," in *Proc. Web Conf. (WWW '21)*, 2021, pp. 2745–2756. [Online]. Available: https://nrl.northumbria.ac.uk/id/eprint/45486 (accessed 22.10.2026).
14. L. Edwards and E. Harbinja, "Protecting post-mortem privacy: Reconsidering the privacy interests of the deceased in a digital world," *Cardozo Arts & Entertainment Law J.*, vol. 32, no. 1, pp. 83–129, 2013.
15. A. Whitten and J. D. Tygar, "Why Johnny can't encrypt: A usability evaluation of PGP 5.0," in *Proc. 8th USENIX Security Symp.*, Washington, DC, USA, 1999, pp. 169–184.
16. J. Brooke, "SUS: A 'quick and dirty' usability scale," in *Usability Evaluation in Industry*, P. W. Jordan, B. Thomas, B. A. Weerdmeester, and I. L. McClelland, Eds. London, U.K.: Taylor & Francis, 1996, pp. 189–194.
17. А. Б. Жанабилова, «Наследование цифровых активов», дис. … канд. юрид. наук, Санкт-Петербургский государственный университет, Санкт-Петербург, 2025. [Online]. Available: https://disser.spbu.ru/files/2025/disser_zhanabilova.pdf (accessed 22.10.2026).
18. Р. Ю. Закиров и Э. А. Хаярова, «Перспектива включения аккаунта в социальной сети в наследственную массу», *Юридический вестник Дагестанского государственного университета*, т. 46, № 2, с. 99–104, 2023, doi: 10.21779/2224-0241-2023-46-2-99-104.
19. Гражданский кодекс Республики Казахстан (Особенная часть) от 1 июля 1999 года № 409-I, раздел 6 «Наследственное право», ст. 1040 (accessed 22.10.2026). [Online]. Available: https://adilet.zan.kz/rus/docs/K990000409_
20. Закон Республики Казахстан от 21 мая 2013 года № 94-V «О персональных данных и их защите», ст. 12 (accessed 22.10.2026). [Online]. Available: https://adilet.zan.kz/rus/docs/Z1300000094/z13094.htm
