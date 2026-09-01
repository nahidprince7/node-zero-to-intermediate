# Day 82 — Passport, JwtStrategy, and Guards in Nest

> Core lesson: about 90 minutes. Convert a verified access token into `request.user` and protect routes by default.

## Learning Objectives

- configure Passport JWT with a bearer extractor;
- verify token configuration and load a current principal;
- protect endpoints with `AuthGuard('jwt')`;
- distinguish 401 authentication failure from 403 authorization denial.

## 0–25 Minutes — Auth Module

Install the Nest Passport/JWT packages and their required types using versions compatible with the project. Register JWT configuration from `ConfigService`; fail startup if the secret, issuer, or audience is missing.

```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, users: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow("JWT_SECRET"),
      issuer: "blog-api",
      audience: "blog-client",
    });
    this.users = users;
  }

  async validate(payload: AccessClaims) {
    return this.users.toPrincipal(Number(payload.sub));
  }
}
```

Declare the private `users` member normally in real code. Validate claim shape and reject missing, deleted, or disabled users. This database lookup lets account changes take effect before token expiry; document the cost.

## 25–50 Minutes — Login Issues a Token

After credential verification, sign and return:

```json
{ "accessToken": "...", "tokenType": "Bearer", "expiresIn": 900 }
```

Do not return the password hash. Keep signing in `AuthService`, verification in the strategy, and credential lookup in `UsersService`.

## 50–70 Minutes — Guard Routes

```ts
@UseGuards(AuthGuard("jwt"))
@Post("posts")
createPost(@Req() request: RequestWithUser) {
  return this.posts.create(request.user.id, /* dto */);
}
```

No token, malformed token, invalid signature, and expired token return 401. A valid reader denied from an author action returns 403 later. Prefer a global auth guard plus explicit `@Public()` metadata when most endpoints are private; it prevents accidentally forgetting guards.

## Practice

1. Test valid, missing, malformed, expired, and wrong-secret tokens.
2. Confirm `request.user` is a safe principal, not a database credential row.
3. Protect post creation and comment creation.
4. Leave published post reads public.
5. Add Swagger bearer authentication metadata.

## Completion Checklist

- [ ] Config failure stops application startup.
- [ ] Strategy verifies expiry, issuer, and audience.
- [ ] A current safe principal becomes `request.user`.
- [ ] Protected routes return 401 for authentication failures.
- [ ] Public-route exceptions are explicit and tested.

## Official References

- [Nest authentication](https://docs.nestjs.com/security/authentication)
- [Nest Passport recipe](https://docs.nestjs.com/recipes/passport)

