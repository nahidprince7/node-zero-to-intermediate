# Day 99 — Prevent Data Leaks: Selection and Serialization

> Core lesson: about 90 minutes. Make safe response shapes an architectural rule, not developer memory.

## Learning Objectives

- fetch only fields needed for a use case;
- map persistence records to explicit response DTOs;
- use Nest serialization as defense in depth;
- test every role/view for sensitive-field absence.

## 0–25 Minutes — Minimize at the Query

Select `id`, `displayName`, and public profile fields when including authors. Never fetch `passwordHash`, refresh-token hashes, moderation internals, or private email for a public post response. Minimization improves safety and query cost.

Different views need different DTOs: `PublicUserResponse`, `SelfUserResponse`, `AdminUserResponse`, `PublicPostResponse`. One giant entity serializer with conditional holes is hard to audit.

## 25–50 Minutes — Explicit Mapping

```ts
export function toPublicAuthor(user: PublicAuthorRecord) {
  return { id: user.id, displayName: user.displayName };
}
```

Map at a stable boundary. Do not spread database records into responses (`{ ...user }`), because adding a private column later silently exposes it. Avoid returning Prisma records directly from controllers.

## 50–70 Minutes — Serialization Defense

Use `ClassSerializerInterceptor`/`@Exclude()` where it fits, but do not rely on it as the only protection: plain objects, nested relations, and alternative transports can bypass assumptions. Query selection plus explicit DTO mapping is primary; serialization is a backstop.

Scrub logs too. Authorization headers, cookies, tokens, passwords, and connection strings must be redacted. Error filters must not echo DTOs containing credentials.

## Practice

1. Search controllers for raw entity returns and object spreads.
2. Create a field-by-role response matrix.
3. Add a fake sensitive field and prove tests catch exposure.
4. Inspect Swagger schemas for private fields.
5. Audit structured logs and error responses.

## Completion Checklist

- [ ] Public queries select minimal fields.
- [ ] Response DTOs differ by audience.
- [ ] Persistence records are explicitly mapped.
- [ ] Serialization provides defense in depth.
- [ ] Automated tests forbid sensitive keys recursively.

## Official Reference

- [Nest serialization](https://docs.nestjs.com/techniques/serialization)

