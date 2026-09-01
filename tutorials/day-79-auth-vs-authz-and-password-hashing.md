# Day 79 — Authentication, Authorization, and Password Hashing

> Core lesson: about 90 minutes. Separate identity from permission and store password verifiers safely.

## Learning Objectives

- distinguish authentication from authorization;
- hash passwords with Argon2id or bcrypt rather than encrypting them;
- verify without leaking which credential failed;
- choose cost settings and migration strategy deliberately.

## 0–20 Minutes — Two Different Questions

Authentication asks “who is this caller?” Authorization asks “may this caller perform this action?” Login can establish identity; roles and ownership decide permissions later. A JWT does not itself prove the bearer may edit a particular post.

## 20–45 Minutes — Hash, Salt, Verify

Prefer Argon2id when available in the project environment. A mature library generates a random salt and encodes algorithm parameters with the hash.

```ts
import * as argon2 from "argon2";

const passwordHash = await argon2.hash(password, {
  type: argon2.argon2id,
});

const valid = await argon2.verify(passwordHash, candidate);
```

If using bcrypt, choose a reviewed work factor and remember its input-length behavior. Never use SHA-256/MD5 directly for passwords, never log passwords, and never implement cryptography yourself.

## 45–65 Minutes — Service Boundary

Create `PasswordHasher` with `hash` and `verify`, then inject its implementation. This enables tests and future parameter upgrades. Enforce a sensible minimum and maximum password length in the DTO; maximum length also limits denial-of-service work.

Return the same generic login failure for unknown email and wrong password. Internally log only safe operational context. Consider performing a dummy verification for unknown users if timing differences matter to the threat model.

## 65–80 Minutes — Operational Decisions

Hash cost is a latency/memory tradeoff, so benchmark on deployment-like hardware. Store only the encoded hash. Rehash after successful login when stored parameters are weaker than current policy. Password reset uses a separate short-lived random token, never password recovery.

## Exercises

1. Hash the same password twice and explain the different outputs.
2. Verify correct and incorrect candidates.
3. Prove neither API responses nor logs contain the hash.
4. Mock `PasswordHasher` in a service test.
5. Write authentication and authorization examples from the blog.

## Completion Checklist

- [ ] Authentication and authorization are explained separately.
- [ ] Passwords use a maintained password-hashing library.
- [ ] Plaintext passwords and hashes never enter responses/logs.
- [ ] Login failures do not enumerate accounts.
- [ ] Hash policy can be upgraded later.

## Official References

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Node argon2 package](https://github.com/ranisalt/node-argon2)

