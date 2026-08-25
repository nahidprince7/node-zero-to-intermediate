# Node.js: Zero to Intermediate

A structured, hands-on backend development curriculum that starts with JavaScript fundamentals and ends with a tested, Dockerized, and deployed blog API.

The course contains **110 lessons across 22 planned weeks**, based on one focused hour per study day. Every concept is explained before it is applied, with examples, exercises, review questions, and project milestones.

## What You Will Learn

- Modern JavaScript and asynchronous programming
- TypeScript fundamentals and developer tooling
- Node.js core APIs, streams, events, and raw HTTP
- Express, REST API design, middleware, and validation
- NestJS modules, controllers, providers, DTOs, and dependency injection
- PostgreSQL, SQL, Prisma, relationships, migrations, and seed data
- Authentication, JWT, roles, permissions, and ownership rules
- Blog features including posts, comments, categories, tags, search, and pagination
- Unit, integration, and end-to-end testing
- Security, performance, logging, health checks, Docker, CI/CD, and deployment

## Roadmap

| Phase | Lessons | Focus |
|---|---:|---|
| JavaScript Foundations | 1–18 | Syntax, functions, collections, modules, async JavaScript |
| TypeScript | 19–29 | Types, classes, decorators, generics, tooling |
| Node.js | 30–41 | Runtime, npm, core modules, streams, raw HTTP |
| Express and REST | 42–53 | Routing, middleware, API structure, validation, security |
| NestJS | 54–65 | Architecture, dependency injection, DTOs, Swagger |
| Data and Blog Features | 66–91 | PostgreSQL, Prisma, authentication, complete blog domain |
| Production Quality | 92–110 | Testing, hardening, Docker, GitHub Actions, deployment |

## Final Project

The running project is a production-minded blog API featuring:

- registration and JWT authentication;
- author, reader, and administrator roles;
- draft and published posts with unique slugs;
- categories, tags, comments, and moderation;
- pagination, filtering, sorting, and search;
- consistent validation and error responses;
- OpenAPI documentation and automated tests;
- Docker, CI checks, and deployment.

## Repository Structure

```text
.
├── README.md
├── Tutorials/
│   ├── syllabus.md
│   └── day-XX-*.md
└── practice/
    └── day-XX/
```

- [`Tutorials/syllabus.md`](Tutorials/syllabus.md) contains the complete roadmap.
- `Tutorials/day-XX-*.md` contains each step-by-step lesson.
- `practice/day-XX/` contains the learner's code and exercises.

## How to Study

1. Complete one tutorial at a time.
2. Type every command and code example yourself.
3. Predict output before running the program.
4. Finish the independent exercises and review questions.
5. Commit completed work so the Git history becomes a progress log.

The goal is understanding and independent problem-solving—not merely finishing lessons quickly.

## Current Progress

Tutorials **Day 1–10** are available. Additional tutorials will be added progressively according to the syllabus.

## Topics After This Course

Advanced subjects such as worker threads, WebSockets, Redis, queues, microservices, deep performance profiling, observability, and horizontal scaling are intentionally reserved for a later **Advanced Node.js and Scalable Systems** phase.
