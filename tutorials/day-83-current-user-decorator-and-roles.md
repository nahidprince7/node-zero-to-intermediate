# Day 83 — Current User Decorator and Roles

> Core lesson: about 75–90 minutes. Replace request plumbing with typed identity and add coarse-grained role authorization.

## Learning Objectives

- create a typed parameter decorator;
- attach required roles as route metadata;
- implement a role guard;
- keep roles coarse and ownership checks resource-aware.

## 0–20 Minutes — Principal Type and Decorator

```ts
export interface AuthPrincipal {
  id: number;
  role: "READER" | "AUTHOR" | "ADMIN";
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthPrincipal =>
    context.switchToHttp().getRequest<RequestWithUser>().user,
);
```

Use it as `@CurrentUser() user: AuthPrincipal`. Keep the principal minimal and ensure the authentication guard runs first; the decorator should not silently invent an anonymous user.

## 20–45 Minutes — Role Metadata

```ts
export const ROLES_KEY = "roles";
export const Roles = (...roles: AuthPrincipal["role"][]) =>
  SetMetadata(ROLES_KEY, roles);
```

A `RolesGuard` reads handler/class metadata with `Reflector`, permits routes without role metadata, and checks the authenticated principal. Apply auth before roles. Use 401 when identity is absent/invalid and 403 when a known identity lacks permission.

## 45–65 Minutes — Permission Matrix

| Action | Reader | Author | Admin |
|---|---:|---:|---:|
| read published post | yes | yes | yes |
| comment | yes | yes | yes |
| create post | no | yes | yes |
| manage taxonomy | no | no | yes |
| moderate comments | no | no | yes |

Roles answer broad questions. “Can this author edit this post?” depends on the loaded post's `authorId`, so Day 84 handles it in a service policy.

## Practice

1. Protect post creation with `AUTHOR` or `ADMIN`.
2. Protect taxonomy writes with `ADMIN`.
3. Test all cells in the matrix.
4. Confirm a reader receives 403, not 401, on an author route.
5. Decide whether admins inherit every permission or use explicit policies.

## Completion Checklist

- [ ] Controllers receive typed principals through `@CurrentUser()`.
- [ ] Required roles are route metadata.
- [ ] Auth guard precedes role guard.
- [ ] 401 and 403 behavior is correct.
- [ ] Ownership is not incorrectly reduced to a role.

## Official References

- [Nest custom decorators](https://docs.nestjs.com/custom-decorators)
- [Nest authorization](https://docs.nestjs.com/security/authorization)

