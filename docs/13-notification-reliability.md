# 13. Notification Reliability Specification

Task: DIP-27. Specification owner: Aibyn Samat. Reviewer and integration-test owner (M6/M8/M12): Alisher Medebaev. Version: 24.10.2026, pre-defense 1.

This specification completes the design deliverable now. Live gateway, restart, browser and device tests remain implementation work; no production delivery measurements are claimed.

## 13.1 Event, channel and fallback matrix

Only channels configured for that recipient and covered by the applicable consent may be used. Email may warn about failure but cannot answer a check-in or replace the Telegram Mini App's cryptographic operations.

| Event | Receiver | Primary dispatch | Fallback / parallel channel | All permitted channels unavailable |
|---|---|---|---|---|
| Invitation | Invited person | SMS in the synthetic-data prototype (FR-INV-02) | Owner shares a prepared Telegram message (FR-INV-03); real-data use is gated by legal analysis 12.4 | Invitation stays SENT/failed-delivery; never accepted automatically; owner sees failure. |
| Scheduled, repeated and final check-in | Owner | Configured SMS and Telegram, independently | Use the remaining configured check-in channel; email is an operational warning only | Freeze this escalation step; do not count it as missed or enter AWAITING CONFIRMATION. Retry next configured daily check-in time. |
| Event-confirmation request | Each accepted trusted person | Telegram | SMS after explicit Telegram failure or 60 seconds without confirmation | Keep the request pending; no confirmation is invented and k cannot be bypassed. |
| Confirmation, withdrawal, decline or failed key check | Owner | Configured SMS, Telegram and email independently | Other configured channels | Persist the event and show it at next login; if it is part of an active release process, apply the owner-notification gate below. |
| Waiting period start and each 24-hour notice | Owner | All configured SMS, Telegram and email independently | The other configured channels | Pause the release countdown; do not enter RELEASED on an unnotified waiting-period deadline. |
| Cancellation | Trusted persons | Telegram | SMS if Telegram fails and contact use is permitted | Cancellation takes effect immediately; queue the notice. Notification failure never undoes an owner's veto. |
| Capsule becomes AVAILABLE | Assigned recipients | Telegram | SMS if permitted and Telegram fails | Queue the notice, show status on next Mini App visit; do not revoke access already correctly released. |
| Periodic key check | Trusted persons and recipients | Telegram | SMS reminder/link if Telegram fails and consent permits | Record key status as unknown, notify owner when reachable; never count silence as a confirmation. |

For confirmation requests, send the initial Telegram attempt at t=0, start SMS fallback by t=60 seconds if needed, and aim to receive a positive transport confirmation within 5 minutes under the assumptions of FR-NOT-04. A provider outage is reported as a failed target, not hidden as successful delivery.

## 13.2 What confirmation means

| Channel | Positive transport confirmation | Not sufficient | Limitation |
|---|---|---|---|
| SMS | Authenticated delivery report/status lookup with a final delivered status and matching provider message ID | HTTP success for enqueueing, a timeout or pending status | A delivery report is not proof that the owner read or understood the SMS. |
| Telegram | Successful Bot API response with a matching chat/message ID | A request merely sent, invalid chat, blocked bot or timeout | Telegram API acceptance confirms dispatch to a chat, not reading on the device. |
| Email | SMTP/provider accepted-for-delivery response and message ID | Connection attempt, rejection, known bounce | Acceptance is not inbox placement or reading; a later failure invalidates the current notification evidence. |

The internal field is `transportConfirmed`, not `humanRead`. The OR of current permitted channel confirmations is used for the notification guard. A reply is a separate authenticated event; link previews never count (FR-ACT-16). Unknown/pending status never counts as success. These are explicit design assumptions (ASM); transport acknowledgements cannot guarantee human awareness or exclude every false release.

Record `eventId`, process/step version, pseudonymous recipient ID, channel, attempt number, due/actual times, provider message ID, status and sanitized failure category. Keep full phone numbers, tokens, credentials and capsule data out of logs. Callbacks are authenticated and matched to the current event/version; duplicates and stale callbacks are idempotent and cannot advance the state twice.

## 13.3 Retries and recovery

Initial attempt at t=0; at least three retries at +1, +5 and +15 minutes after the initial attempt for transient failures (4 total attempts). Values are project defaults (ASM), not provider guarantees. Honor Retry-After without a busy loop; log deferred attempts. Permanent errors such as invalid address or blocked bot trigger immediate fallback and are not retried unchanged; the three-retry test uses a transient-failure double.

Channels have separate jobs, deadlines and circuit breakers. A failed SMS call cannot block Telegram/email. Use provider idempotency where available; otherwise deduplicate logical actions and tolerate duplicate messages after an ambiguous timeout. Exactly-once external SMS delivery is not promised.

Persist notification intents and timers transactionally with the process transition (outbox + Quartz JDBC JobStore). A restart reloads outstanding attempts rather than clearing them or creating another activation. Delayed callbacks must carry the event version. Recovery of timers must meet NFR-REL-01 (within one hour); timely recovery does not override the transport guard.

After a retry batch is exhausted, persist a visible delivery fault. For check-ins reattempt at the next configured daily time, with new expiry tokens; old tokens cannot count. The ordinary escalation schedule is day 0, +2 and +3 only when transport is confirmed on schedule. An outage suspends that schedule: after successful redispatch restart the full response window for the current step, then preserve the +2/+1 spacing. Never release immediately because an outage consumed the original deadlines. The final check-in has a one-hour response window after confirmed dispatch/redispatch (project assumption). Thus the precise ideal escalation deadline is interval + 3 days + 1 hour. Day-granularity M1b rounds away that hour; exact timer tests must not. The cabinet's approximate total silence text remains interval + 3 days and must disclose the final reply window in detailed settings.

## 13.4 Fail-closed state guards

`notificationFault` is a persisted flag on the existing activation state, not a new state that silently changes the diagram's vocabulary.

1. A check-in step is missed only after a positive transport confirmation for that step and expiry of its response window with no valid answer. Without confirmation, the current state stays ACTIVE or CHECK-IN PENDING; no escalation based solely on failed transport occurs (FR-NOT-13).
2. Reaching k confirmations enters WAITING PERIOD, but the countdown runs only while the required owner start/daily notification is transport-confirmed. Total owner-channel failure pauses it. After channels recover, deliver a fresh owner notice and restart the full configured waiting period. Record the reset; do not reuse an expired deadline (FR-NOT-14).
3. A valid owner cancellation always succeeds before RELEASED, including during an outage; delete submitted shares and invalidate release jobs transactionally.
4. At the final release transaction recheck k, process version, cancellation, waiting-period expiry and the notification guard. A racing stale timer cannot bypass a pause/cancellation.

This chooses confidentiality and protection from false activation over availability. A permanent total outage can prevent legitimate release indefinitely. Report this as a limitation, not as reliability success; the cabinet shows a delivery fault and the next recovery action.

## 13.5 Acceptance and test cases

| Case | Setup / action | Expected result | Metric / requirement |
|---|---|---|---|
| NR-01 | SMS transient failures, Telegram success | Telegram not delayed; at least 3 SMS retries logged with due times; one logical event | M8, NFR-REL-02 |
| NR-02 | Both SMS and Telegram fail for 60 simulated days | No outage-caused escalation to AWAITING CONFIRMATION and no release; log fault, email warning only if email is available | M12, E10, FR-NOT-13 |
| NR-03 | All owner channels fail at waiting-period start or daily notice | Countdown pauses, no RELEASED despite a fast-forward beyond original deadline; recovery starts a full new waiting period | M12, E11, FR-NOT-14 |
| NR-04 | Restart during retries, check-in escalation or paused waiting period | Persisted jobs recover within one hour, no duplicate transition; pause/confirmation status survives | M6, NFR-REL-01 |
| NR-05 | Repeated/out-of-order callback or webhook for an old process | No duplicate confirmation or release; stale event ignored and audited | FR-NOT-12, FR-ACT-06 |
| NR-06 | Delivery recovers after original check-in deadline | Current step gets a fresh response window; no immediate escalation; old token cannot answer | FR-NOT-13, FR-ACT-16 |
| NR-07 | Owner cancels while a delayed release job is queued | Cancellation wins before release; job rejects stale process version | FR-ACT-10, FR-NOT-14 |
| NR-08 | A positive SMTP enqueue is followed by a known bounce | Mark failed, use another permitted owner channel; if none succeeds, apply the waiting-period guard | FR-NOT-12, FR-NOT-14 |

Specification review and a standalone model can be run for pre-defense 1. Backend integration tests with actual persistence, callbacks and provider contracts are not yet executable; Alisher owns those results in DIP-21. Results must distinguish `model checked`, `integration not run` and `live-provider not run`.

## 13.6 Operations and alerting

Monitor failed/pending attempts by channel, oldest outbox age, delayed Quartz jobs and paused processes. Alert the operator via a separate operational route after a failed retry batch; expose the same fault at next login. Acknowledging an operational alert does not mark a user message delivered. Store alert/contact metadata in the Kazakhstan deployment and assess third-party transfers under section 12.3. Before a pilot, set thresholds from actual provider behavior and document rate limits; no delivery percentage is claimed from the present mockups.
