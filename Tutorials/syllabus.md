# Node.js Backend Syllabus — JavaScript to a Deployed Blog API

> Location: `/home/nahid/Projects/Learning/app` — tutorials live in `Tutorials/`.

## Goal

Learn backend development properly: JavaScript → TypeScript → Node.js → Express → NestJS → PostgreSQL → deployment. Every topic is learned before it is used, and the running project is a complete blog API.

This is a **Node.js** course, not only a NestJS course. Raw Node and Express come before the framework on purpose. NestJS's default HTTP adapter is Express (Fastify is a supported alternative), so the Express concepts you learn — middleware, `req`/`res`, routing — are the ones Nest is wrapping. Learn them first and Nest stops being magic.

## Study Plan

- Daily study time: **1 hour**
- Schedule: **5 days per week**
- Weekly time: **5 hours**
- Total: **110 lessons = 22 weeks**
- Realistic finish: **23–25 weeks.** Some lessons run long (see ⏱ below) and life happens. The plan builds in slack; use it.

### Day numbers are labels, not deadlines

Day 47 is always "rebuild the API in Express" — the number identifies the lesson so tutorials and notes stay in sync. It does **not** mean you must be on Day 47 in calendar week 10.

**If a topic needs two sessions, take two.** Understanding is the unit of progress, not the date. The ↻ days exist so the plan absorbs this instead of breaking.

### Markers used in this plan

| Marker | Meaning |
|---|---|
| **↻** | Review, practice, or catch-up day — no new concepts. 11 of them, roughly one every two weeks. |
| **⏱** | Commonly takes two sessions. Installs, Docker, and deployment are environment-dependent and go wrong in ways tutorials cannot predict. Budget accordingly. |

**Do not skip a ↻ day to get ahead.** Skipping review is the slowest possible shortcut.

### The daily 1-hour format

| Time | What |
|---|---|
| 0–10 min | Recall yesterday out loud / from memory, no notes |
| 10–30 min | New concept (the tutorial's explanation + examples) |
| 30–55 min | Type the code yourself and do the exercise |
| 55–60 min | Write 2–3 lines: what I learned, what confused me |

### Rules that make it fast

1. **Never copy-paste code.** Type it. Typing is where the learning happens.
2. **One hour means one hour.** Stop on time even mid-topic. Tomorrow continues.
3. **Confused is normal.** Note the confusion, move on. Most of it clears in 2–3 days.
4. **Missed a day?** Do not double up. Carry it to the next ↻ day.
5. **Commit to git every day.** Your commit history is your progress bar.

## Decisions Already Made

| Choice | Decision | Why |
|---|---|---|
| Language | TypeScript | NestJS is TS-first; it is not optional |
| Database | PostgreSQL | Free, standard, relational, real-world |
| ORM | **Prisma** | Fastest to learn, excellent type safety and migrations. TypeORM is the alternative if you specifically need it for a job — say so and it will be swapped |
| Framework path | raw `http` → Express → NestJS | Express is Nest's default adapter; seeing the layers underneath is what makes it click |
| CI | GitHub Actions | Free for your repo, and the concepts transfer to any CI system |
| Scope | Backend only | Frontend is a separate plan, later |

---

# PHASE 1 — JavaScript Foundations · Days 1–18

## Week 1 · Days 1–5

1. **⏱** Environment setup: nvm, Node, VS Code, terminal basics, running your first `.js` file
2. Values, variables (`let`/`const`), data types, operators
3. Control flow: `if`, `switch`, loops, truthiness
4. Functions, arrow functions, parameters, scope, closures (intro)
5. Arrays and objects: creating, reading, updating, nesting

## Week 2 · Days 6–10

6. Git basics: `init`, `add`, `commit`, `log` — start your learning repo
7. Destructuring, spread, and rest
8. Array methods: `map`, `filter`, `find`, `some`, `every`
9. `reduce` and method chaining
10. ES modules: `import`/`export`, splitting code across files

## Week 3 · Days 11–15

11. Errors and debugging: stack traces, `console` methods, the VS Code debugger
12. **↻** Build one small script using everything from Days 1–11
13. Why async exists: call stack, callbacks, the event loop (mental model)
14. Promises: `then`, `catch`, `finally`
15. `async` / `await`

## Week 4 · Days 16–20

16. Error handling in async code: `try`/`catch`, why unhandled rejections bite
17. `Promise.all`, `allSettled`, `race` — sequential vs parallel work
18. **↻** Fetch from a public API, process the data, handle the failures

**Phase 1 outcome:** write JavaScript confidently, debug your own mistakes, and reason about async instead of guessing.

# PHASE 2 — TypeScript · Days 19–29

19. Why TypeScript, installing `tsc`, `tsconfig.json`, first typed file
20. Primitives, arrays, objects, function types, inference

## Week 5 · Days 21–25

21. Interfaces vs type aliases
22. Unions, literal types, optional properties, enums
23. Narrowing and type guards
24. **↻** Convert your Day 12 script to TypeScript
25. Classes, constructors, access modifiers, `readonly`

## Week 6 · Days 26–30

26. Decorators — what they are and how NestJS uses them
27. Generics and the utility types built on them: `Partial`, `Pick`, `Omit`, `Record`
28. Project tooling: ESLint, Prettier, `ts-node-dev`, npm scripts
29. **↻** TypeScript review — fix every type error yourself, no `any`

**Phase 2 outcome:** read and write typed code well enough that NestJS makes sense.

# PHASE 3 — Node.js Itself · Days 30–41

30. What Node.js is: runtime vs browser, when to use it, managing versions

## Week 7 · Days 31–35

31. `npm`, `package.json`, dependencies vs devDependencies, scripts, semver
32. CommonJS vs ES modules in Node
33. `path`, `process`, `os`, environment variables, `dotenv`
34. `fs`: reading and writing files safely, sync vs async vs promises
35. `events` and `EventEmitter`

## Week 8 · Days 36–40

36. Streams and buffers I: why they exist, readable and writable
37. Streams II: `pipe`, transform streams, backpressure (intro)
38. The `http` module: build a server with no framework
39. Routing and parsing a JSON body by hand — feel the pain Express removes
40. HTTP fundamentals: methods, status codes, headers, bodies

## Week 9 · Days 41–45

41. **↻** Build a raw Node JSON API with three working endpoints

**Phase 3 outcome:** you know what a framework does for you, because you did it without one.

# PHASE 4 — Express and REST · Days 42–53

42. Express setup, first app, routing
43. Route params, query params, the `req` and `res` objects
44. Middleware: how it actually works, ordering, `next()`
45. Error-handling middleware and 404s

## Week 10 · Days 46–50

46. Structuring an app: routers, controllers, services
47. **↻** Rebuild Day 41's API in Express and compare the two line by line
48. REST principles and resource design
49. **Blog milestone:** design the blog's resources and endpoints — users, posts, comments, categories, tags
50. Input validation and a consistent error response shape

## Week 11 · Days 51–55

51. Testing APIs: `curl`, Thunder Client / Postman, `.http` files
52. Security basics: never trust input, handling secrets, CORS
53. **↻** Checkpoint — build a small Express API from an empty folder, unaided

**Phase 4 outcome:** design a clean REST API before a framework designs it for you.

# PHASE 5 — NestJS · Days 54–65

54. Why NestJS exists, the Nest CLI, project structure, bootstrap
55. Modules

## Week 12 · Days 56–60

56. Controllers and HTTP method decorators
57. Providers and dependency injection
58. The request lifecycle end to end
59. `ConfigModule` and environment management — **Blog milestone:** plan the blog's modules
60. DTOs

## Week 13 · Days 61–65

61. Validation with `class-validator` and `ValidationPipe`
62. Pipes and transformation
63. Exception filters and consistent errors
64. Logging
65. Swagger / OpenAPI — **Blog milestone:** document the posts endpoints

**Phase 5 outcome:** build validated, documented NestJS endpoints.

# PHASE 6 — Data and Blog Features · Days 66–91

## Week 14 · Days 66–70

66. Relational concepts: tables, rows, primary and foreign keys, constraints
67. The SQL you actually need: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `WHERE`, `ORDER BY`, `JOIN`
68. **⏱** Running PostgreSQL in Docker, connecting, `psql` basics
69. Prisma: setup, schema, first model, first migration
70. Relations in Prisma: one-to-one, one-to-many, many-to-many

## Week 15 · Days 71–75

71. **Blog milestone:** the full blog schema, migrated and seeded
72. Wiring Prisma into Nest; the service/repository boundary
73. Posts: create and read
74. Posts: update, delete, and unique slugs
75. Database error handling: unique-constraint and not-found errors, foreign-key violations, mapping database errors to clean HTTP responses, transactions (intro)

## Week 16 · Days 76–80

76. Categories and tags (many-to-many)
77. Comments
78. **↻** Catch-up on the whole data layer
79. Auth vs authz; password hashing with bcrypt/argon2
80. Registration and login flow

## Week 17 · Days 81–85

81. JWT: what is inside a token, signing, expiry, refresh (concept)
82. Passport, `JwtStrategy`, and guards in Nest
83. Current-user decorator; roles: author, reader, admin
84. Ownership rules — you can only edit your own post — **Blog milestone:** the blog is secured
85. Drafts and publishing

## Week 18 · Days 86–90

86. Dates and time zones: storing UTC, `createdAt` / `updatedAt` / `publishedAt`, formatting for clients, scheduled publishing
87. Pagination
88. Filtering and sorting
89. Search basics
90. Comment moderation and soft deletion

## Week 19 · Days 91–95

91. **↻** Catch-up — **at this point you have a working blog API**

**Phase 6 outcome:** a practical, usable blog API rather than only basic CRUD.

# PHASE 7 — Production Quality · Days 92–110

92. What is worth testing; the testing pyramid; Jest in NestJS
93. Unit tests: a service with mocked dependencies, and controller tests
94. Integration tests: `Test.createTestingModule` with real providers, exercising a module against a real database
95. E2E tests: `supertest` setup, a dedicated test database, and test-data cleanup and isolation between runs

## Week 20 · Days 96–100

96. E2E: the auth and posts flows
97. Coverage — what is useful and what is theatre
98. `helmet`, CORS done properly, rate limiting
99. Not leaking data: field selection and serialization
100. Database indexes, the N+1 query problem, and caching concepts

## Week 21 · Days 101–105

101. Structured logging and health checks
102. **↻** Refactor pass over the whole codebase
103. Environments: development, test, production; the production build
104. **⏱** Docker fundamentals and a Dockerfile for the API
105. **⏱** `docker-compose`: API and PostgreSQL together

## Week 22 · Days 106–110

106. Running migrations during deployment
107. CI/CD: a GitHub Actions pipeline that lints, tests, and builds on every push
108. **⏱** Deploying to a host, with secrets and environment config
109. **↻** Buffer — deployment overrun and loose ends
110. **Final:** documentation, project review, knowledge check

**Phase 7 outcome:** your blog API is live, tested, and documented, with CI running on every push.

---

## Fast Track — If You Want It Sooner

- **Already know JavaScript well?** Compress Days 1–11 into 3 days. Do **not** compress Days 13–18 (async).
- **Ship earlier:** you have a working API at **Day 91**. Jump straight to Days 103–108 (deployment) and you are live around **Day 97**. Come back for testing and hardening afterwards.
- **Never skip:** Days 13–18 (async), 36–41 (streams and raw HTTP), 66–71 (database), 79–84 (auth). These are the four places people build permanent gaps.
- **Never skip a ↻ day.** See rule 4.

## Final Blog Scope

- User registration and login
- JWT authentication
- Author, reader, and administrator roles
- Posts: create, edit, draft, publish, delete, slugs
- Categories and tags
- Comments and moderation
- Pagination, filtering, sorting, search
- Correct date and time-zone handling
- Validation, database error mapping, and consistent error responses
- OpenAPI / Swagger documentation
- Unit, integration, and E2E tests
- Security and performance basics
- Dockerized, CI-checked, and deployed

## Reference Material

Use these when a tutorial is not enough. Do not read them cover to cover.

- MDN JavaScript Guide — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- javascript.info — https://javascript.info
- TypeScript Handbook — https://www.typescriptlang.org/docs/handbook/intro.html
- Node.js docs — https://nodejs.org/docs/latest/api/
- Express guide — https://expressjs.com/en/guide/routing.html
- NestJS docs — https://docs.nestjs.com
- Prisma docs — https://www.prisma.io/docs
- PostgreSQL tutorial — https://www.postgresqltutorial.com
- GitHub Actions docs — https://docs.github.com/en/actions

## Tutorial Format

Tutorials are created **one at a time**, one per study day. Each contains:

1. Learning objectives
2. Prerequisites and the 1-hour time breakdown
3. A plain-language explanation
4. Focused examples
5. Guided practice
6. Independent exercises
7. Common mistakes and debugging advice
8. Review questions
9. A completion checklist
10. The next blog-project milestone, when relevant

The next tutorial is not generated until the current one is reviewed, or you ask to continue.

## Progress Tracking

Keep a `Tutorials/progress.md` file. One line per day:

```
Day 12 — 2026-09-05 — done — reduce still fuzzy, redo exercise 3
Day 13 — 2026-09-08 — half — event loop unclear, continuing tomorrow
```

Anything marked fuzzy or half gets revisited on the next ↻ day.

## Topics Remaining After This Syllabus

Not covered here, and not needed before the blog project:

- Deeper event loop internals, worker threads, clustering, child processes
- WebSockets and real-time applications
- Redis and distributed caching
- Queues, background jobs, scheduled tasks
- File uploads, object storage, email delivery
- Advanced transactions, locking, and race conditions
- Performance profiling and memory leak debugging
- Microservices and message brokers
- Metrics, tracing, observability
- Horizontal scaling and load balancing
- Publishing reusable npm packages

These form a separate **Advanced Node.js and Scalable Systems** phase later.

## Approval Check

Before Tutorial 1 is written, confirm or change:

- 1 hour per day, 5 days per week, 110 lessons over 22 weeks (23–25 realistically)
- The order: JavaScript → TypeScript → Node → Express → NestJS
- Prisma as the ORM (TypeORM if you prefer)
- PostgreSQL as the database
- GitHub Actions for CI
- The final blog feature list
- One tutorial per study day, generated one at a time
