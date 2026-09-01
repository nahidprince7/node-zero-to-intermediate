# Day 54 — Why NestJS Exists: CLI, Project Structure, and Bootstrap

> Core lesson: about 60–90 minutes, plus installation time. Begin Nest only after understanding the Node and Express layers it organizes.

## Learning Objectives

You will learn to:

- explain what Nest adds above Express or Fastify;
- scaffold a strict Nest project with the CLI;
- identify the generated project files;
- trace application bootstrap from `main.ts`;
- run, build, lint, and test the starter;
- distinguish Nest architecture from hidden magic.

## 0–12 Minutes — Why NestJS

Express provides routing and middleware with few architectural opinions. Nest adds a consistent application structure built around:

- modules and an application dependency graph;
- controllers and route decorators;
- providers and dependency injection;
- pipes, guards, interceptors, and exception filters;
- testing utilities and integrations;
- TypeScript metadata and conventions.

Nest uses Express by default and supports Fastify as an alternative. The Node HTTP and Express concepts from Days 30–53 still apply; Nest coordinates them through higher-level abstractions.

Nest is useful when conventions and dependency boundaries help a growing codebase or team. A small script may not need a framework of this size.

## 12–30 Minutes — Scaffold with the CLI

Check the current official prerequisites and use the latest active LTS Node release. Current Nest application and generator requirements may differ, so both Node and CLI checks matter:

```bash
node --version
npm --version
cd /home/nahid/Projects/Learning/app
npx @nestjs/cli@latest new day-54 \
  --directory practice/day-54 \
  --package-manager npm \
  --strict \
  --skip-git \
  --no-observe
```

When asked for a module system, choose **ESM** to continue the course's modern module path. The current ESM starter uses its generated testing and linting choices; use the generated scripts rather than copying an older tutorial's configuration over them.

The command downloads packages and creates many files. If installation fails, preserve the first meaningful error, verify Node/CLI prerequisites, and retry only after fixing the cause.

Do not initialize a nested Git repository because the course workspace already has one.

## 30–42 Minutes — Read the Generated Structure

The exact scaffold can evolve, but the core files include:

```text
practice/day-54/
├── src/
│   ├── app.controller.ts
│   ├── app.controller.spec.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── nest-cli.json
├── package.json
└── tsconfig.json
```

- `main.ts` is the process entry point;
- `app.module.ts` is the root module;
- controller handles HTTP requests;
- service is an injectable provider;
- spec files contain tests;
- `nest-cli.json` configures Nest tooling;
- generated TypeScript and lint/test configs match the chosen scaffold.

Inspect before deleting. Generated starter code is a small working example of controller-to-provider injection.

## 42–55 Minutes — Trace Bootstrap

The generated `main.ts` follows this shape:

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
```

`NestFactory.create(AppModule)` starts from the root module, builds the module/provider graph, creates the underlying HTTP application, and runs startup hooks. `listen` opens the network port.

The exact generated import style depends on the selected module system. Preserve the scaffold's working conventions.

Add a global prefix if desired:

```ts
app.setGlobalPrefix("api");
```

Then the starter route moves from `/` to `/api`. A prefix is separate from API versioning.

## 55–68 Minutes — Run the Toolchain

Inspect `package.json`, then use its generated scripts:

```bash
npm run start:dev
npm run build
npm run lint
npm test
```

In another terminal:

```bash
curl -i http://127.0.0.1:3000/
```

Watch mode is for development. A production process runs compiled output with the generated production script. Build success proves compilation, not correct runtime behavior or deployment readiness.

## 68–78 Minutes — CLI Generators

Preview commands and generate intentionally:

```bash
npx nest --help
npx nest generate --help
npx nest generate module posts --dry-run
npx nest generate controller posts --dry-run
npx nest generate service posts --dry-run
```

Use `--dry-run` to understand proposed writes. Generators reduce repetitive typing and can update module metadata, but you remain responsible for placement, names, behavior, and reviewing every change.

Do not use the full resource generator yet; Days 55–60 build each concept separately.

## Guided Practice — Understand the Starter

1. Scaffold the strict ESM project.
2. Run the generated app and request its route.
3. Trace controller → service → returned response.
4. Change the service message and confirm watch reload.
5. run build, lint, and tests;
6. preview module/controller/service generators;
7. add `/api` prefix and update the request;
8. draw the bootstrap path from process entry to HTTP response.

## Independent Exercises

1. Explain each generated dependency in broad terms.
2. Remove the service injection temporarily and observe the changed graph.
3. Introduce a TypeScript error and inspect build output.
4. Introduce a lint error and inspect lint output.
5. Run a generator with `--dry-run` and compare proposed files.
6. Find where the port is chosen.
7. Identify evidence that Express is the default adapter.
8. List what Nest standardizes beyond Day 46's manual structure.

## Common Mistakes and Debugging Advice

- Verify current Node prerequisites before blaming Nest.
- Avoid a nested Git repository inside the course repo.
- Preserve the generated module-system conventions.
- Read generator changes before accepting them.
- Watch mode, build, lint, and test prove different things.
- A global prefix is not automatically API versioning.
- Decorators provide metadata; they do not remove HTTP semantics.
- Nest organizes Express/Node rather than replacing their fundamentals.

## Review Questions

1. What architectural concerns does Nest add?
2. Which HTTP adapter is used by default?
3. Why start from `AppModule`?
4. What does `NestFactory.create` build?
5. Why separate `create` from `listen` conceptually?
6. What does strict scaffolding contribute?
7. Why use generator dry runs?
8. When might Express or raw Node remain the simpler choice?

## Completion Checklist

- [ ] A strict current Nest project is scaffolded.
- [ ] No nested Git repository was created.
- [ ] Generated files and roles are understood.
- [ ] Bootstrap is traced from `main.ts`.
- [ ] Development, build, lint, and test scripts pass.
- [ ] Generator dry runs are inspected.
- [ ] All exercises and review questions are complete.

## Official References

- Nest first steps and prerequisites: https://docs.nestjs.com/first-steps
- Nest CLI usage: https://docs.nestjs.com/cli/usages
- Nest platform overview: https://docs.nestjs.com/

## What to Send for Review

Send Node/CLI versions, generated tree, successful command output, bootstrap diagram, generator dry runs, exercises, and review answers. Next: **Day 55 — NestJS Modules**.
