# Day 86 — Dates, Time Zones, and Scheduled Publishing

> Core lesson: about 90 minutes. Store instants consistently and make future publication an explicit workflow.

## Learning Objectives

- distinguish an instant from a displayed local time;
- store and exchange UTC timestamps safely;
- define `createdAt`, `updatedAt`, and `publishedAt` semantics;
- implement idempotent scheduled publishing.

## 0–20 Minutes — Instants and Representations

PostgreSQL and JavaScript date behavior can hide timezone mistakes. Treat stored application timestamps as instants. Exchange ISO 8601 strings with an explicit `Z` or offset:

```text
2026-08-31T10:15:00Z
2026-08-31T16:15:00+06:00
```

A string without an offset is ambiguous and should be rejected for scheduling. Store the instant in UTC; format it for the user's timezone at the client/presentation boundary. Never store a formatted label such as “31 Aug, 4:15 PM” as the source of truth.

## 20–40 Minutes — Timestamp Semantics

- `createdAt`: database-generated creation instant;
- `updatedAt`: changes whenever persisted content/state changes;
- `publishedAt`: when content became publicly publishable;
- optional `scheduledFor`: requested future instant;

Do not use application-local `new Date()` in many unrelated places. Inject a `Clock` abstraction into scheduling/publishing services so tests control “now.” Database and app hosts should run with UTC defaults, while still accepting offset-aware input.

## 40–65 Minutes — Scheduling Workflow

Add nullable `scheduledFor`, migrate, and expose a command that requires a future offset-aware timestamp. A worker/cron process later finds:

```text
status = DRAFT
scheduledFor <= now
```

For each due post, conditionally update it to `PUBLISHED`, set `publishedAt`, and clear `scheduledFor`. The conditional update makes retries idempotent and prevents two workers from publishing twice. Do not rely on an in-memory `setTimeout`; restarts lose it and long delays are fragile.

## 65–80 Minutes — Boundary Tests

Test explicit `Z`, `+06:00`, daylight-saving zones at the formatting boundary, equal-to-now, past schedules, invalid calendar dates, restart/retry behavior, and two workers claiming the same post. Use fake time rather than waiting in tests.

## Exercises

1. Convert Dhaka input with `+06:00` to its UTC instant.
2. Reject an offset-free schedule string.
3. Make the publisher safe to run twice.
4. Decide what editing a scheduled post does to the schedule.
5. Decide whether unpublishing clears `publishedAt`.

## Completion Checklist

- [ ] API timestamps contain `Z` or an explicit offset.
- [ ] Storage semantics for every timestamp are documented.
- [ ] Tests inject a controllable clock.
- [ ] Scheduled publishing survives process restarts.
- [ ] Concurrent/repeated workers cannot double-publish.

## Official References

- [PostgreSQL date/time types](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [MDN Date](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

