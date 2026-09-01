# Day 81 — JWT: Claims, Signing, Expiry, and Refresh

> Core lesson: about 75–90 minutes. Understand the token contract before wiring Passport.

## Learning Objectives

- read the three JWT segments without treating them as encrypted;
- design minimal access-token claims;
- validate signature, issuer, audience, and expiry;
- explain a safer refresh-token lifecycle.

## 0–20 Minutes — What a JWT Is

A compact JWT is `header.payload.signature`. Header and payload are base64url-encoded, not secret. Anyone holding the token can read claims. The signature detects tampering when verification uses the correct trusted key and algorithm.

Useful claims:

```json
{
  "sub": "42",
  "role": "AUTHOR",
  "iss": "blog-api",
  "aud": "blog-client",
  "iat": 1788163200,
  "exp": 1788164100
}
```

Keep claims minimal. Never include password hashes, secrets, or large user profiles.

## 20–45 Minutes — Access Tokens

Use `@nestjs/jwt` with a long random secret from validated configuration, or an asymmetric key pair when separate services verify tokens. Pin allowed algorithm, issuer, and audience during verification. Use short expiry and compare numeric user IDs only after intentional parsing.

```ts
const accessToken = await jwt.signAsync(
  { sub: String(user.id), role: user.role },
  { issuer: "blog-api", audience: "blog-client", expiresIn: "15m" },
);
```

Do not commit keys or log tokens. HTTPS is required because a bearer token grants access to whoever possesses it.

## 45–65 Minutes — Refresh Concept

Refresh tokens should be high-entropy, longer-lived credentials with server-side revocation state. Store only a hash of an opaque refresh token, rotate it on use, revoke the old token, and detect reuse. A second long-lived JWT with no revocation design is not a complete refresh system.

This course implements access-token authentication first. Write the refresh design and defer its implementation unless the product requires it.

## Practice

1. Decode a test token and observe readable claims.
2. Change one payload character and verify signature failure.
3. Test expired, wrong-issuer, and wrong-audience tokens.
4. Rotate the development secret and observe old-token failure.
5. Draw refresh issue → hash/store → rotate → revoke → reuse response.

## Completion Checklist

- [ ] JWT payload is treated as public/readable.
- [ ] Claims are minimal and typed.
- [ ] Verification checks more than the signature.
- [ ] Access tokens expire quickly.
- [ ] Refresh rotation/revocation is understood.

## Official References

- [Nest JWT authentication](https://docs.nestjs.com/security/authentication)
- [RFC 7519: JSON Web Token](https://www.rfc-editor.org/rfc/rfc7519)

