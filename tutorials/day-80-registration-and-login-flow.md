# Day 80 — Registration and Login Flow

> Core lesson: about 90 minutes. Build credential flows that reveal little and return only safe identity data.

## Learning Objectives

- register a user with normalized email and hashed password;
- authenticate credentials with a generic failure response;
- prevent mass assignment and duplicate-account races;
- define session/token output without implementing JWT yet.

## 0–20 Minutes — DTOs

```ts
export class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @Length(12, 128) password!: string;
  @IsString() @Length(2, 80) displayName!: string;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}
```

Clients cannot choose `role`, `passwordHash`, ID, or timestamps. Normalize email consistently before lookup and storage. Do not silently transform passwords.

## 20–45 Minutes — Register

```text
validate → normalize email → hash password → insert READER → map safe response
```

Rely on the unique email constraint for the final race-safe decision. Map duplicates to the chosen stable response (commonly 409), but consider a less revealing generic response for public products with strict anti-enumeration needs.

Never return the stored record directly. Map `{ id, email, displayName, role, createdAt }` explicitly.

## 45–65 Minutes — Login

```text
normalize email → load private credential record → verify → return safe principal
```

Use one `UnauthorizedException("Invalid email or password")` for unknown email and bad password. Rate limiting arrives on Day 98; note it now as required security work. JWT issuance arrives tomorrow, so today return/test the principal only.

## 65–80 Minutes — Tests

Cover successful registration, invalid DTO, duplicate email, hash-not-plaintext proof, successful login, unknown email, wrong password, and disabled/deleted-account policy if present. Assert the hasher is called and `passwordHash` is absent from serialized results.

## Exercises

1. Make email normalization a tested pure function.
2. Send two simultaneous registrations for the same email.
3. Add Swagger schemas without example real passwords.
4. Decide whether registration logs the user in automatically.
5. Identify rate-limit and audit events needed later.

## Completion Checklist

- [ ] Registration stores a hash and server-selected role.
- [ ] Duplicate races resolve through database uniqueness.
- [ ] Login uses a single generic credential failure.
- [ ] Private credential records are never serialized.
- [ ] Success and failure paths have tests.
