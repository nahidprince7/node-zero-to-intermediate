# Day 51 — Testing APIs with `curl`, API Clients, and `.http` Files

> Core lesson: about 60–90 minutes. Turn casual endpoint clicking into a repeatable contract-checking workflow.

## Learning Objectives

You will learn to:

- inspect request and response details with `curl`;
- test JSON bodies, headers, queries, and methods;
- distinguish exploratory checks from automated tests;
- organize requests in a version-controlled `.http` file;
- design a success-and-failure test matrix;
- avoid leaking secrets through commands and client workspaces.

## Setup

Run the Day 47 Express API in one terminal. Use a second terminal for requests:

```bash
cd /home/nahid/Projects/Learning/app/practice/day-47
npm run dev
```

Set the base URL only for the current shell if useful:

```bash
API_BASE=http://127.0.0.1:3000
```

Do not store production credentials in shell history, committed files, screenshots, or shared API-client workspaces.

## 0–18 Minutes — Read `curl` Precisely

```bash
curl -i "$API_BASE/posts"
curl -v "$API_BASE/posts/1"
curl --fail-with-body -sS "$API_BASE/posts/999"
```

- `-i` includes response headers in normal output;
- `-v` shows request and connection details on stderr and may reveal sensitive headers;
- `-sS` removes the progress meter but retains error messages;
- `--fail-with-body` makes HTTP 4xx/5xx produce a failing exit status while retaining the body.

HTTP failure and transport failure are different. A 404 proves a server responded; connection refusal, DNS failure, and timeout mean no normal HTTP response completed.

Inspect the exit status immediately:

```bash
curl --fail-with-body -sS "$API_BASE/posts/999"
echo $?
```

## 18–32 Minutes — Send Complete Requests

Create JSON:

```bash
curl -i -X POST "$API_BASE/posts" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  --data '{"title":"API Testing","body":"A repeatable request body","published":false}'
```

`--data` makes curl use POST unless another method is specified, but keeping `-X POST` can make an instructional command explicit. Quote JSON with single quotes in Bash so double quotes reach the server unchanged.

Test query encoding safely:

```bash
curl -i --get "$API_BASE/posts" \
  --data-urlencode 'published=true' \
  --data-urlencode 'q=Node streams'
```

Upload a body from a file when it is large or reused:

```bash
curl -i "$API_BASE/posts" \
  -H 'Content-Type: application/json' \
  --data-binary @create-post.json
```

Never add `-k` merely to silence a TLS certificate error. Fix trust or use the correct development endpoint.

## 32–45 Minutes — Test More Than the Happy Path

Build a matrix before testing:

| Case | Expected status | Important assertion |
|---|---:|---|
| List posts | 200 | `data` is an array |
| Read existing post | 200 | requested ID/slug matches |
| Read missing post | 404 | stable error code |
| Create valid post | 201 | `Location` is present |
| Malformed JSON | 400 | `MALFORMED_JSON` |
| Wrong media type | 415 | `UNSUPPORTED_MEDIA_TYPE` |
| Invalid fields | 422 | field details present |
| Oversized body | 413 | stable error shape |
| Unsupported method | 405 | `Allow` is present |
| Unknown path | 404 | route error, not post error |

Also test boundaries: minimum length, maximum length, just outside each bound, empty values, repeated queries, missing headers, and unexpected fields.

Manual requests are excellent for exploration and debugging. They are not a replacement for repeatable automated assertions, which arrive in the testing phase.

## 45–60 Minutes — Version-Controlled `.http` Files

Create `practice/day-51/blog-api.http`:

```http
@baseUrl = http://127.0.0.1:3000

### Health
GET {{baseUrl}}/health
Accept: application/json

### List published posts
GET {{baseUrl}}/posts?published=true
Accept: application/json

### Create a post
POST {{baseUrl}}/posts
Content-Type: application/json
Accept: application/json

{
  "title": "HTTP File",
  "body": "This request can be reviewed with the code.",
  "published": false
}

### Malformed JSON
POST {{baseUrl}}/posts
Content-Type: application/json

{ bad json }
```

VS Code REST Client, JetBrains HTTP Client, and other tools support similar—but not perfectly identical—syntax. Keep the file simple or document the required client.

Commit safe local base URLs and placeholder variables. Put real tokens in an ignored environment file supported by the chosen client, and verify the ignore rule before saving them.

## 60–70 Minutes — GUI API Clients

Thunder Client and Postman can help with:

- discovering and editing requests;
- inspecting formatted bodies and headers;
- grouping requests into collections;
- switching environments;
- sharing examples with teammates.

Treat exported collections as source code: review them for secrets, generated IDs, accidental production URLs, and nondeterministic assumptions. A successful green response in a GUI is evidence for one request, not a regression suite by itself.

## Guided Practice — Contract Check Collection

Create a `.http` file or client collection that covers every Day 47 endpoint and failure. For every request, record:

1. purpose;
2. exact expected status;
3. important response headers;
4. expected body shape or absence;
5. setup data it depends on;
6. whether it changes server state.

Order state-changing requests deliberately and include a reset/restart note for the in-memory API.

## Independent Exercises

1. Compare `-i`, `-v`, and `--fail-with-body`.
2. Inspect curl exit codes for 404 and connection refusal.
3. Send query values containing spaces and punctuation.
4. Create JSON inline and from a file.
5. Test every status in the Day 50 validation table.
6. Add HEAD and DELETE requests and verify body rules.
7. Export a GUI collection and inspect it for secrets.
8. Write three assertions that future automated tests should make.

## Common Mistakes and Debugging Advice

- Test status, headers, and body—not only visible JSON.
- A 4xx response is different from a transport failure.
- Quote shell JSON correctly.
- Use URL encoding for arbitrary query values.
- Do not disable TLS verification as a routine fix.
- Keep secrets out of commands, committed files, and screenshots.
- Reset or isolate state before assuming request order.
- Manual checks do not prevent regressions automatically.

## Review Questions

1. What does `--fail-with-body` change?
2. How does a transport failure differ from an HTTP 500?
3. Why test response headers?
4. What belongs in a failure matrix?
5. Why are boundary values valuable?
6. What makes a `.http` file reviewable?
7. Where should client secrets live?
8. What remains missing from manual API testing?

## Completion Checklist

- [ ] Curl requests cover methods, headers, queries, and bodies.
- [ ] Exit statuses and HTTP statuses are distinguished.
- [ ] Success and failure matrices are complete.
- [ ] A safe `.http` file is version-controlled.
- [ ] No real secret appears in requests or exports.
- [ ] Stateful request ordering is documented.
- [ ] All exercises and review questions are complete.

## Official References

- curl command-line options: https://curl.se/docs/manpage.html
- VS Code REST Client syntax: https://github.com/Huachao/vscode-restclient
- HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110

## What to Send for Review

Send the request matrix, `.http` file or sanitized collection, representative terminal output, secret-safety check, future assertion list, exercises, and review answers. Next: **Day 52 — Security Basics, Secrets, and CORS**.
