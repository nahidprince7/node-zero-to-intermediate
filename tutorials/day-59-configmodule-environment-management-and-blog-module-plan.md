# Day 59 — `ConfigModule`, Environment Management, and the Blog Module Plan

> Core lesson: about 60–90 minutes. Validate configuration once at startup, then define the blog's Nest module boundaries.

## Learning Objectives

You will learn to:

- install and register `@nestjs/config`;
- validate environment values during bootstrap;
- inject configuration without scattered `process.env` access;
- protect secrets and maintain `.env.example`;
- choose global versus feature configuration deliberately;
- turn the Day 49 resource design into a Nest module graph.

## 0–15 Minutes — Register Configuration

Install the official package:

```bash
cd /home/nahid/Projects/Learning/app/practice/day-54
npm install @nestjs/config
```

Register it in `AppModule`:

```ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    PostsModule,
  ],
})
export class AppModule {}
```

`forRoot` is a dynamic-module configuration call. It loads environment configuration, including the project-root `.env` by default, and makes `ConfigService` available. `isGlobal: true` is a conscious course choice for configuration; feature modules will still use explicit imports for domain capabilities.

## 15–35 Minutes — Validate at Startup

Create `src/config/environment.ts`:

```ts
export interface Environment {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  DATABASE_URL: string;
}

export function validateEnvironment(
  values: Record<string, unknown>,
): Environment {
  const nodeEnv = values.NODE_ENV ?? "development";
  const port = values.PORT === undefined ? 3000 : Number(values.PORT);
  const databaseUrl = values.DATABASE_URL;

  if (
    nodeEnv !== "development" &&
    nodeEnv !== "test" &&
    nodeEnv !== "production"
  ) {
    throw new Error("NODE_ENV must be development, test, or production");
  }

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer from 1 to 65535");
  }

  if (typeof databaseUrl !== "string" || databaseUrl.length === 0) {
    throw new Error("DATABASE_URL is required");
  }

  return { NODE_ENV: nodeEnv, PORT: port, DATABASE_URL: databaseUrl };
}
```

Connect it:

```ts
ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  validate: validateEnvironment,
});
```

Environment values start as strings or missing. Failing during startup is safer than discovering invalid configuration halfway through a request.

Schema validation libraries are another option, but do not add one until you understand the boundary it serves.

## 35–47 Minutes — Consume Configuration

Use the validated port in `main.ts`:

```ts
import { ConfigService } from "@nestjs/config";

const app = await NestFactory.create(AppModule);
const config = app.get(ConfigService);
const port = config.getOrThrow<number>("PORT");

await app.listen(port);
```

Inject configuration into a provider when needed:

```ts
@Injectable()
export class DatabaseConnectionInfo {
  constructor(private readonly config: ConfigService) {}

  hasDatabaseConfiguration(): boolean {
    return this.config.getOrThrow<string>("DATABASE_URL").length > 0;
  }
}
```

Do not print the URL; it may include credentials. Prefer domain-specific configuration wrappers when many providers would otherwise repeat raw key strings.

Avoid mixing validated `ConfigService` access with scattered `process.env` reads, which bypasses the established boundary.

## 47–58 Minutes — Safe Environment Files

Create `.env.example`:

```text
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

Ensure `.gitignore` covers real files:

```text
.env
.env.*
!.env.example
```

The template documents names and safe placeholders, not real shared development credentials. Production secrets belong in the deployment platform's secret/configuration system.

Test missing, empty, malformed, and valid values. Never include secrets in thrown messages.

## 58–75 Minutes — Plan the Blog Modules

Translate Day 49 into this first module graph:

```text
AppModule
├── ConfigModule (global configuration boundary)
├── DatabaseModule (Prisma lifecycle later)
├── AuthModule
│   └── imports UsersModule
├── UsersModule
├── PostsModule
│   └── imports UsersModule, CategoriesModule, TagsModule
├── CommentsModule
│   └── imports PostsModule, UsersModule
├── CategoriesModule
└── TagsModule
```

This is a planning graph, not permission to inject every service into every other feature. Revisit directions as use cases become concrete. Database access may be exported by an infrastructure module, while domain modules keep controllers and application rules cohesive.

Create `practice/day-54/docs/module-plan.md` containing for each module:

- responsibility;
- controllers it owns;
- providers it owns;
- providers it exports;
- modules it imports;
- resources/endpoints from Day 49;
- likely circular dependency risks;
- unresolved decisions.

## 75–85 Minutes — Configuration Ownership

Not every setting belongs in one flat global list. Group settings by concern when the project grows:

```text
app.port
database.url
auth.jwtSecret
auth.accessTokenTtl
cors.allowedOrigins
```

The official configuration package supports namespaced configuration and partial feature registration. Use those when they improve ownership. Validate custom configuration inside its factory where required; do not assume every loaded custom file is automatically validated.

Today, keep the implementation small and the future ownership plan explicit.

## Guided Practice — Validated Bootstrap and Module Plan

1. Register `ConfigModule` once.
2. Validate environment and convert `PORT` to a number.
3. require `DATABASE_URL` without logging it;
4. use `ConfigService` in bootstrap;
5. create safe ignored/template environment files;
6. test four configuration failure cases;
7. draft the complete blog module graph;
8. document imports, exports, and unresolved risks.

## Independent Exercises

1. Test every permitted `NODE_ENV` value.
2. Test port boundaries and non-numeric input.
3. Confirm real environment variables override file values.
4. Inject `ConfigService` into a provider.
5. Replace a scattered `process.env` read.
6. Decide which configuration should be namespaced later.
7. Identify two possible circular dependencies in the blog graph.
8. Remove one unnecessary planned provider export.

## Common Mistakes and Debugging Advice

- Environment input is untrusted string data.
- Load and validate configuration before listening.
- Do not log secret values in success or failure paths.
- Keep `.env.example` safe and real `.env` ignored.
- `isGlobal` is convenient but should remain an intentional choice.
- Avoid scattered `process.env` access after defining the boundary.
- A module diagram is a hypothesis that evolves with use cases.
- Export providers only when another module truly consumes them.

## Review Questions

1. What does `ConfigModule.forRoot` do?
2. Why validate during startup?
3. Why convert the port explicitly?
4. What belongs in `.env.example`?
5. Why avoid printing `DATABASE_URL`?
6. What tradeoff comes with global configuration?
7. How do Day 49 resources map to feature modules?
8. Why should the module plan record open risks?

## Completion Checklist

- [ ] Official configuration package is registered.
- [ ] Required values and conversions are validated.
- [ ] Bootstrap uses `ConfigService`.
- [ ] Real secrets are ignored and never logged.
- [ ] Blog module graph is documented.
- [ ] Imports and exports have stated reasons.
- [ ] All exercises and review questions are complete.

## Official References

- Nest configuration: https://docs.nestjs.com/techniques/configuration
- Nest dynamic modules: https://docs.nestjs.com/fundamentals/dynamic-modules
- Nest modules: https://docs.nestjs.com/modules

## What to Send for Review

Send configuration code, safe template/ignore rules, startup failure output, module graph, module responsibility plan, exercises, and review answers. Next: **Day 60 — Data Transfer Objects**.
