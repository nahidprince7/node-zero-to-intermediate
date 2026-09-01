# Day 90 — Comment Moderation and Soft Deletion

> Core lesson: about 90 minutes. Preserve moderation history while hiding removed content from normal reads.

## Learning Objectives

- distinguish author deletion from moderator action;
- model soft-deletion metadata and moderation state;
- make normal queries exclude removed content by default;
- retain audit evidence without retaining unnecessary sensitive content forever.

## 0–20 Minutes — State Model

Add fields such as:

```prisma
enum CommentStatus { VISIBLE HIDDEN DELETED }

model Comment {
  // existing fields
  status CommentStatus @default(VISIBLE)
  deletedAt DateTime? @map("deleted_at")
  deletedById Int? @map("deleted_by_id")
  moderationReason String? @map("moderation_reason")
}
```

Choose relations and delete behavior for `deletedById` deliberately. `DELETED` means author/admin removal; `HIDDEN` means moderator suppression pending policy. Do not overload an empty body as state.

## 20–45 Minutes — Commands and Permissions

```text
DELETE /comments/:id              owner or admin
POST   /comments/:id/hide         admin
POST   /comments/:id/restore      admin
```

Soft-delete atomically records status, time, actor, and reason where required. Make repeated delete idempotent or return 409—document the choice. Restoration must define whether the body was preserved and whether the parent post still permits comments.

## 45–65 Minutes — Read Safety

Every ordinary comment query must exclude `HIDDEN`/`DELETED`, or return a tombstone such as `{ id, status: "DELETED" }` when conversation continuity matters. Centralize these repository methods; scattered `status` filters are easy to forget. Admin moderation queues are separate, guarded endpoints with pagination.

Soft deletion is not magical compliance. Rows still exist, unique constraints still apply, backups retain data, and privacy policies may require later hard deletion/anonymization. Define a retention job and audit access rather than retaining everything forever.

## 65–80 Minutes — Race and Audit Tests

Test owner deletion, other-user denial, admin hide/restore, repeated commands, public list exclusion, admin queue inclusion, deletion racing with edit, and a deleted parent post. Use conditional updates or transactions so state checks and writes cannot drift.

## Exercises

1. Choose tombstone versus omission for nested comment lists.
2. Prevent editing non-visible comments.
3. Add moderation reason validation and safe response mapping.
4. Design a retention/anonymization job without implementing it.
5. Audit every comment query for visibility defaults.

## Completion Checklist

- [ ] Moderation states have explicit meanings.
- [ ] Owner and admin permissions differ correctly.
- [ ] Normal reads cannot leak hidden/deleted content.
- [ ] State changes record actor and time atomically.
- [ ] Race cases and repeated commands are tested.
- [ ] Retention and eventual hard deletion are documented.

## Official Reference

- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

