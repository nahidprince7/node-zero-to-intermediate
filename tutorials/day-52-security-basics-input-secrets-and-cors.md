# Day 52 — Security Basics: Untrusted Input, Secrets, and CORS

> Core lesson: about 60–90 minutes. Reduce obvious risk without pretending one middleware makes an API secure.

## Learning Objectives

You will learn to:

- apply a simple threat-modeling habit;
- treat every external value as untrusted;
- store and log secrets safely;
- configure a narrow CORS policy;
- explain what CORS does and does not protect;
- add baseline HTTP hardening and dependency hygiene.

## 0–15 Minutes — Ask Four Security Questions

For each endpoint, ask:

1. What untrusted data enters?
2. What valuable data or action can it reach?
3. What resource can it exhaust?
4. What information could errors or logs reveal?

Security is a system property. Validation, authentication, authorization, database constraints, rate limits, TLS, deployment configuration, logging, backups, and updates reinforce one another. No single package closes every risk.

## 15–30 Minutes — Never Trust Input

Input includes more than JSON bodies:

- route and query values;
- headers, cookies, and tokens;
- filenames and uploaded files;
- database content originally supplied by users;
- environment variables and webhook payloads;
- third-party API responses.

Continue the Day 50 practices: validate type, format, length, range, allowed values, and unknown fields. Enforce body limits before expensive work. Later, use parameterized database queries through Prisma rather than building SQL strings.

Do not turn validation into HTML escaping everywhere. Validation asks whether data is permitted; output encoding depends on where data is later rendered. A backend returning JSON should preserve legitimate content while clients safely render it.

Avoid user-controlled redirects:

```ts
const allowedRedirects = new Set(["/dashboard", "/posts"]);
const destination = typeof request.query.next === "string"
  ? request.query.next
  : "/dashboard";

response.redirect(allowedRedirects.has(destination) ? destination : "/dashboard");
```

## 30–42 Minutes — Secrets and Logs

Secrets include database credentials, signing keys, API tokens, session secrets, and private certificates.

- load them from deployment-managed environment configuration;
- keep `.env` and `.env.*` ignored;
- commit only `.env.example` placeholders;
- validate required configuration at startup;
- rotate a secret if it was exposed—deleting the latest file does not erase Git history;
- grant each credential only the permissions it needs.

Never log entire request headers, bodies, environment objects, user records, or error objects without considering sensitive fields. Redact at the logging boundary:

```ts
const safeRequestLog = {
  method: request.method,
  path: request.path,
  requestId: response.locals.requestId,
  contentLength: request.get("content-length"),
};
```

Passwords should not appear in success responses, validation details, or debug logs. Password hashing arrives with authentication; plain-text passwords must never be stored.

## 42–58 Minutes — CORS Is a Browser Read Policy

Install the maintained Express middleware:

```bash
npm install cors
npm install --save-dev @types/cors
```

Configure known development origins:

```ts
import cors from "cors";

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

app.use(cors({
  origin(origin, callback) {
    const allowed = origin === undefined || allowedOrigins.has(origin);
    callback(null, allowed);
  },
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 600,
}));
```

Requests without `Origin`, such as server-to-server calls or curl, are allowed here. Choose this deliberately for the product.

For an unlisted browser origin, the middleware omits permission rather than treating CORS as server authorization. Browser JavaScript cannot read the response, but the endpoint's authentication and authorization must still protect the operation.

CORS headers tell browsers whether JavaScript from an origin may read a response. CORS does not authenticate users, authorize operations, or stop curl and servers from sending requests. The server may still process a disallowed cross-origin request, so state-changing routes need real authorization and, for cookie authentication, an appropriate CSRF strategy.

Do not combine credentialed cross-origin requests with a wildcard origin. Allow exact trusted origins and use secure cookie configuration later.

## 58–68 Minutes — Preflight

Browsers may send an `OPTIONS` preflight before a cross-origin request using methods or headers that are not CORS-safelisted:

```http
OPTIONS /posts/42 HTTP/1.1
Origin: http://localhost:5173
Access-Control-Request-Method: PATCH
Access-Control-Request-Headers: content-type,authorization
```

Application-level `cors` middleware handles preflight for routes. Test it:

```bash
curl -i -X OPTIONS http://127.0.0.1:3000/posts/42 \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: PATCH' \
  -H 'Access-Control-Request-Headers: Content-Type,Authorization'
```

Test both allowed and disallowed origins. A curl response does not reproduce browser enforcement, but it lets you inspect the policy headers.

## 68–78 Minutes — Baseline Hardening

Install and register Helmet:

```bash
npm install helmet
```

```ts
import helmet from "helmet";

app.disable("x-powered-by");
app.use(helmet());
```

Helmet sets multiple defensive HTTP response headers. Review its current defaults and adjust only for a concrete need. It does not validate input, configure TLS, authenticate callers, or fix vulnerable dependencies.

Also:

- use a supported Node and Express version;
- commit the lockfile;
- review `npm audit` findings in context and update deliberately;
- use HTTPS/TLS in production, commonly at a trusted reverse proxy;
- set proxy trust only to match the actual deployment topology;
- return generic unexpected errors.

Rate limiting and broader production hardening return on Day 98.

## Guided Practice — Harden the Express API

Add:

1. strict input and body-size limits;
2. ignored real environment files plus `.env.example`;
3. safe request logging;
4. an exact development-origin allowlist;
5. preflight support through `cors`;
6. Helmet and disabled `x-powered-by`;
7. generic 500 responses;
8. tests for allowed/disallowed origins and leaked fields.

Write a one-page threat note for post creation: assets, inputs, abuse cases, controls, and remaining risks.

## Independent Exercises

1. Find every external input in the current API.
2. Attempt an open redirect and then constrain it.
3. Verify `.env` is ignored without printing its content.
4. Inspect response headers before and after Helmet.
5. Test CORS preflight from two origins.
6. Call the API with curl despite a disallowed browser origin and explain why it works.
7. Audit logs and responses for passwords and tokens.
8. Review dependencies without applying blind breaking upgrades.

## Common Mistakes and Debugging Advice

- Security is layered; middleware is only one layer.
- Validate every input channel and bound resource use.
- Removing a committed secret does not rotate or erase it.
- CORS is not authentication or authorization.
- A disallowed CORS origin may still reach server code.
- Credentialed CORS requires explicit trusted origins.
- Configure `trust proxy` from topology, not guesswork.
- Do not dump sensitive objects into logs.

## Review Questions

1. What four threat questions should you ask?
2. Why is validation different from output encoding?
3. What must happen after a secret is exposed?
4. What does CORS tell a browser?
5. What does CORS not prevent?
6. Why do browsers send preflight requests?
7. What does Helmet contribute?
8. Why must proxy trust match deployment topology?

## Completion Checklist

- [ ] External input and resource limits are inventoried.
- [ ] Secrets are ignored, validated, and never logged.
- [ ] CORS uses an explicit development allowlist.
- [ ] Allowed and disallowed preflights are tested.
- [ ] CORS limitations can be explained accurately.
- [ ] Baseline hardening headers are enabled.
- [ ] A post-creation threat note is complete.
- [ ] All exercises and review questions are complete.

## Official References

- Express security guidance: https://expressjs.com/en/advanced/best-practice-security.html
- Express CORS middleware: https://expressjs.com/en/resources/middleware/cors.html
- Helmet documentation: https://helmetjs.github.io/
- OWASP API Security Top 10: https://owasp.org/API-Security/

## What to Send for Review

Send hardened setup, safe configuration templates, CORS tests, header comparison, threat note, leak audit, exercises, and review answers. Next: **Day 53 — Express Checkpoint from an Empty Folder**.
