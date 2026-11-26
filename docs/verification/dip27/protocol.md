# DIP-27: live notification measurement protocol

Prepared 26 November 2026. Owner: Aibyn Samat. Backend/provider integration: review with Alisher. First-result checkpoint: 5 December. Status: protocol and offline analyser ready; live measurements NOT RUN.

## Purpose and evidence boundaries

Measure Telegram dispatch acceptance, final SMS delivery reports, latency p50/p95, retries and billed cost. This does not establish human awareness, activation safety, M6 restart recovery or M8 backend failover. Those require the running backend and tests in docs/13-notification-reliability.md. Telegram and SMS confirmation percentages have different meanings and must not be presented as equivalent device delivery rates.

No credentials or real recipients are configured by this harness. It reads an already sanitized JSON export and sends no messages. The included fixture is invented test data, visibly labelled `fixture`, never live evidence.

## Pilot procedure

1. Agree provider, test environment, permitted test recipients, explicit consent, sending window and budget before dispatch. Obtain actual gateway pricing and delivery-report semantics; do not infer current prices from examples. Use a separate bot/gateway test configuration. Keep credentials and the alias/contact mapping outside the repository.
2. Proposed initial pilot: at least 30 logical messages per channel across at least three consenting recipients and two time windows. These are planning targets, not completed samples or a statistically representative study. Record actual device, OS, Telegram version, carrier, network and provider in a separate restricted run log. Do not add these as unsupported fields to the analyser input.
3. Use a dedicated harmless test text with no capsule data, secrets or activation links. Assign each logical message an opaque id and recipient alias P01 etc. Record UTC start before first network request, all retry request times, provider acceptance and SMS final delivery-report time. Use a single synchronized collector clock; for callbacks measure receipt at collector, disclose callback/polling lag. Do not mix provider device time with local request time.
4. Set `deadlineAt` before sending (initial pilot target: start + 5 minutes, aligned with the confirmation-request design target). Observe at least until every deadline; record later confirmations up to a declared common cutoff. Never delete failed/pending or slow messages from the export. Freeze the cutoff before calculating results.
5. Preserve attempts in order starting at 1. Follow provider rate limits and the notification retry policy; do not create duplicate sends solely to improve statistics. Reconcile actual charge per attempt from provider billing, including charged failures and multi-segment SMS. Use null when unknown, zero only when verified zero. Telegram API call cost zero does not imply zero infrastructure cost.
6. Review and sanitize export: no tokens, chat IDs, phone numbers, provider IDs, message bodies, contacts or raw callbacks. Keep restricted raw evidence and id mapping separately under the project's retention/consent policy. Commit only reviewed aggregates; `evidence: live` is a label, not authenticity verification.

## Input and calculation

See tests/notifications/example.fixture.json for the exact input shape. Top-level: evidence (`fixture` or `live`), observedUntil, messages. Each message has id, recipientAlias, channel, startedAt, deadlineAt and attempts. Each attempt has number, sentAt, optional acceptedAt, optional deliveredAt (SMS only), and costKzt (number or null). All times must be ISO 8601 with explicit UTC/time-zone offset. Input must contain one row per logical message, including all failures. SMS deliveredAt requires prior acceptedAt. Acceptance and delivery are distinct.

From repository root, Node.js 24, no dependencies:

```sh
node --test tests/notifications/analyse.test.cjs
node tests/notifications/analyse.cjs tests/notifications/example.fixture.json
```

For real data pass the private sanitized JSON path instead of the fixture path. Review output before saving a publishable report.

- Denominator: logical messages per channel, not requests/retries. Report total messages and attempts.
- Telegram transport evidence: successful Bot API acceptance with matching message/chat in the restricted collector; not delivery/read receipt.
- SMS transport evidence: final authenticated provider delivered status matched to the message. HTTP acceptance alone remains unconfirmed. Validate/authenticate callbacks in the real collector; this offline tool cannot authenticate them.
- On-time fraction: first transport confirmation no later than each message's predeclared deadline / all logical messages. Late confirmations remain late even if ultimately delivered. Unknown/pending remains unconfirmed at cutoff, without asserting permanent failure.
- Latency: start to first qualifying confirmation, including retries. Nearest-rank empirical p50/p95, conditional on confirmation by cutoff; always present alongside unconfirmed count. Missing delivery is not zero latency. With a small pilot p95 is unstable and may equal the maximum. No population-confidence claim.
- Cost: sum known per-attempt charges in KZT; unknown charges counted explicitly. Total cost is null while any attempt cost is unknown. No imputed prices or success-only billing denominator.

## Result template for the checkpoint

Run date/cutoff; provider and environment; actual sample and consent summary; clock/callback method; channel definitions; messages/attempts; accepted/confirmed/on-time/unconfirmed; conditional p50/p95; known cost and unknown charges; observed failures; limitations; restricted raw-evidence reference. Record `NOT RUN` for any unexecuted live scenario. Attach analyser version/commit and command.

Pending integrations: real bot and SMS adapter; authenticated callback collection; deduplication; restart recovery and outage/fallback tests with Alisher. No live-provider pass or delivery percentage has been established by preparing these materials.
