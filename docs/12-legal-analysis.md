# 12. Kazakhstan Legal Requirements and Design Decisions

Task: DIP-26. Author: Aibyn Samat. Reviewer: Alisher Medebaev. Prepared: 24.10.2026 for pre-defense 1.

## 12.1 Scope and evidence

This is a requirements analysis of the official texts, not a legal opinion or a certificate of compliance. The platform transfers encrypted information; it does not determine heirs, establish death legally, transfer ownership or replace a notarial will. The legal position of an individual online account also depends on the provider's contract and the nature of the rights involved.

The Personal Data Law [1] was inspected on the official Adilet portal on 24.10.2026, including the displayed amendments and commencement notes. The Civil Code provisions [2] were checked on the official Adilet legacy portal on the same date. Recheck the applicable edition before deployment. No lawyer/notary interview has taken place in the evidence available for this submission: I-01 to I-03 are user interviews, not expert opinions. An expert interview remains an explicit limitation; no I-04 is invented.

## 12.2 Norm-to-design traceability

The legal rule and the project's implementation decision are separated below. A requirement is a design obligation, not evidence that working software already satisfies it.

| Official provision | Requirement of the provision (summary) | Project decision / requirement | Verification evidence needed |
|---|---|---|---|
| Personal Data Law, Article 7(1), (6), (8), (9) [1] | Consent is the general basis, subject to statutory exceptions; processing and disclosure must have specific lawful purposes and use no excessive data. | NFR-LAW-02; FR-INV-08. Collect only necessary contact and role information; do not assume an owner's consent replaces the invited person's consent. | Data inventory, legal basis for each field and operation, consent flow review. |
| Article 8(1), (4)-(7) [1] | Consent must be confirmable; its content includes operator, purpose-related data, duration, third-party and cross-border information; withdrawal must be handled. | NFR-LAW-02. Versioned notice and explicit unticked consent control; record subject, notice version, scope and timestamp. Provide a withdrawal route. | Consent record and withdrawal tests; complete operator details before a real-data pilot. |
| Article 12(1)-(2) [1] | Collect necessary/sufficient data and keep personal-data storage in Kazakhstan; retention is linked to the processing purpose. | NFR-LAW-01 raised from Should to Must. Kazakhstan placement for the application database, replicas, backups, contact-bearing logs and recovery copies. | Hosting contract/region, backup location and restore inventory; no real-data launch without this evidence. |
| Article 7(6), Article 16 [1] | Third-party and cross-border transfers have conditions; cross-border transfer is not automatically permitted merely because a provider offers encryption. | NFR-LAW-04. Inventory SMSC.kz, Telegram and Resend, their subprocessors, destination countries, data and legal basis. | Processor/transfer assessment and notice; a local domain name is not proof of local processing. |
| Article 18, Article 25(2) [1] | Deletion and protection duties apply in the specified circumstances; an operator must document and demonstrate compliance. | FR-INV-08; NFR-LAW-02. Delete declined/expired invitation contacts within the project's 24-hour target, with documented backup retention and deletion propagation. | Deletion tests across primary storage, logs, queues and backups. The 24-hour value is a stricter project target, not a quotation from the law. |
| Article 22(1)-(2) [1] | Protect data against unauthorized access throughout its processing lifecycle and account for relevant actions. | NFR-SEC-01, NFR-SEC-04, NFR-SEC-07; NFR-LAW-01. Encryption of capsule content does not remove obligations for readable contact metadata. | Access-control tests, minimized audit logs, incident and retention procedures. |
| Civil Code, Articles 1038-1040 [2] | Inheritance concerns rights/property that survive death and has statutory or testamentary grounds; some personal rights are excluded. | NFR-LAW-03; proposal 1.8. A selected capsule recipient is not certified as a legal heir by the service. | Scope and interface wording review. |
| Articles 1046 and 1050 [2] | Testamentary disposition and the required form of a will are governed separately. | NFR-LAW-03. Capsule instructions and trustee confirmations are technical directions, not a substitute for the legally required will or proof of death. | No product claim that capsule creation transfers property or authorizes access to every external account. |

## 12.3 Hosting decision

**Decision LD-01:** production personal-data storage, including backups and operational copies, must be physically located in Kazakhstan. The preferred deployment is a Kazakhstan-hosted application and PostgreSQL instance with backups in Kazakhstan; the exact supplier is not yet contracted. This makes NFR-LAW-01 a Must now, rather than postponing the decision until procurement. Development and the pre-defense demonstration use synthetic contacts and content only.

Before real personal data is processed, Alisher must record the provider, physical region, backup/replica locations, support access and recovery arrangements. A provider choice without those facts does not pass the deployment gate. This document does not claim that a server has already been rented or configured.

Local primary storage does not by itself settle transfers to Telegram, SMS or email providers. Resend's existing selection is provisional for personal-data traffic: assess it or replace it before a real-data pilot. Send no capsule titles, plaintext, keys or shares in notifications (FR-NOT-07). A phone number, an email address or an identifying message is still personal data even if capsule content is encrypted.

## 12.4 Consent and the first invitation

FR-INV-08 covers explicit acceptance, refusal/expiry and the deletion target. It does **not** itself establish a legal basis for the earlier step in which an owner enters somebody else's name/number and the server sends an SMS. Later consent must not be treated as retroactively proving that earlier processing was lawful.

**Decision LD-02:** until a documented lawful basis for that initial processing is reviewed, the server-SMS invitation flow is demonstrated only with synthetic data. For a real-data pilot, prefer an owner-shared, unidentifying invitation link: the invited person sees the operator notice and gives consent before providing their own contact information. Do not silently change FR-INV-02/05 into a different identity protocol: the resulting changes to invitations and phone verification require review together. Any reliance on an exception under Article 9 needs a specific, justified assessment; none is presumed here.

The consent notice must identify the actual operator, fields, purpose, period, third parties, cross-border handling, withdrawal and contact route. The checkbox shown in mockup S6-2 is evidence of interface intent, not a complete legal notice. Tests must reject acceptance without explicit consent and verify deletion after refusal/expiry. These gates are NFR-LAW-02 and NFR-LAW-04.

## 12.5 Risk and completion status

R-06 remains **open, partially mitigated**: official article mapping, the Kazakhstan hosting decision and requirement priorities are documented on 24.10.2026. Remaining evidence is expert review, actual supplier/transfer assessment, consent text and working deletion/access-control tests. Probability remains Medium and impact High until those checks exist. The document analysis is ready for review now; operational compliance is not marked complete.

## References

1. Republic of Kazakhstan, Law No. 94-V of 21 May 2013, On Personal Data and Their Protection, Articles 7, 8, 12, 16, 18, 22 and 25. Official Adilet text, inspected 24.10.2026: https://adilet.zan.kz/rus/docs/Z1300000094
2. Republic of Kazakhstan, Civil Code (Special Part), No. 409 of 1 July 1999, Articles 1038-1040, 1046 and 1050. Official Adilet text, inspected 24.10.2026: https://old.adilet.zan.kz/rus/docs/K990000409_
