# Day 65 — Swagger/OpenAPI: Document the Posts API

> Core lesson: about 60–90 minutes. Generate a machine-readable contract and make it agree with the behavior already implemented.

## Learning Objectives

You will learn to:

- distinguish OpenAPI from Swagger UI;
- install and bootstrap Nest's OpenAPI integration;
- describe DTO properties, operations, parameters, and responses;
- document authentication without embedding credentials;
- inspect the generated JSON document;
- detect documentation drift.

## 0–15 Minutes — OpenAPI Versus Swagger

OpenAPI is a language-neutral API description format. Swagger UI is one interface that renders and exercises an OpenAPI document. The document can also support client generation, validation, testing, gateways, and review.

Generated documentation is not automatically correct. Decorators and reflection can describe code structure, but you must document semantics, error cases, examples, authorization, and field meaning.

Do not treat an interactive documentation page as access control. Protected endpoints still require authentication and authorization.

## 15–30 Minutes — Bootstrap Documentation

Install the official package:

```bash
npm install @nestjs/swagger
```

In `main.ts`, before `listen`:

```ts
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const swaggerConfig = new DocumentBuilder()
  .setTitle("Blog API")
  .setDescription("A learning-focused blog backend API")
  .setVersion("1.0")
  .addBearerAuth()
  .addTag("posts", "Create, read, update, and delete blog posts")
  .build();

const documentFactory = () =>
  SwaggerModule.createDocument(app, swaggerConfig);

SwaggerModule.setup("docs", app, documentFactory);
```

Start the app and open `/docs`. Inspect the JSON at `/docs-json` unless you customize the generated document URL.

If the API uses a global `api` prefix, verify the paths shown in the document. Documentation routing and application versioning are separate choices.

## 30–47 Minutes — Describe DTOs

```ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePostDto {
  @ApiProperty({ example: "Learning NestJS", minLength: 3, maxLength: 120 })
  title!: string;

  @ApiProperty({ example: "A detailed article body...", minLength: 10 })
  body!: string;

  @ApiProperty({ example: false })
  published!: boolean;

  @ApiPropertyOptional({ example: 2, nullable: true })
  categoryId?: number | null;

  @ApiPropertyOptional({ type: [Number], example: [1, 4] })
  tagIds?: number[];
}
```

Keep `class-validator` decorators on the same fields. Validation enforces behavior; OpenAPI decorators describe the contract. The Nest Swagger CLI plugin can infer more metadata, but explicit documentation is valuable while learning.

Never use real emails, tokens, passwords, or production content as examples.

## 47–62 Minutes — Describe Operations

```ts
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";

export class PostEnvelopeDto {
  @ApiProperty({ type: () => PostResponseDto })
  data!: PostResponseDto;
}

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  @Post()
  @ApiOperation({ summary: "Create a post" })
  @ApiCreatedResponse({ description: "Post created", type: PostEnvelopeDto })
  @ApiBadRequestResponse({ description: "Malformed request" })
  @ApiUnprocessableEntityResponse({ description: "DTO validation failed" })
  create(@Body() input: CreatePostDto) {}

  @Get(":postId")
  @ApiOperation({ summary: "Read one post" })
  @ApiParam({ name: "postId", type: Number, minimum: 1 })
  @ApiNotFoundResponse({ description: "Post does not exist" })
  findOne(@Param("postId", PositiveIntPipe) postId: number) {}
}
```

If actual responses use `{ data: ... }`, document that envelope rather than pointing directly at a bare `PostResponseDto`. Create explicit response-envelope DTOs or schemas so generated clients see reality.

Document important query defaults and bounds with `@ApiQuery`, and document bodyless 204 responses accurately.

## 62–72 Minutes — Authentication and Exposure

`addBearerAuth()` defines the security scheme. Apply it to protected controllers or operations:

```ts
@ApiBearerAuth()
@Post()
create() {}
```

This describes the requirement; it does not install a guard or validate a token.

Decide whether interactive docs are enabled publicly in production. Options include disabling the UI, protecting it, or publishing only a reviewed static schema. Do not hide undocumented security through obscurity; choose exposure based on the product and threat model.

## 72–82 Minutes — Verify the Contract

```bash
curl -sS http://127.0.0.1:3000/docs-json > /tmp/blog-openapi.json
```

Review:

- every posts method/path;
- request schemas and required fields;
- query and path parameter types;
- success statuses and headers;
- 400/401/403/404/409/422 responses;
- response envelopes;
- bearer security markers;
- absence of internal-only fields.

Later CI can generate and diff or validate the schema. Today compare it manually with Day 49's endpoint contract and Day 51's requests.

## Guided Practice — Posts Milestone

Document all post endpoints from Day 49:

1. list with filtering/pagination queries;
2. create with DTO schema and 201;
3. read by slug or chosen identifier;
4. partial update;
5. bodyless delete;
6. success envelopes;
7. common error envelope;
8. authentication requirements and safe examples.

Create a checklist of any endpoint behavior that is designed but not implemented yet. Label it clearly rather than documenting fiction as available functionality.

## Independent Exercises

1. Document array and nullable properties.
2. Document pagination defaults and maximum limit.
3. Create response-envelope DTOs.
4. Document a 204 without a response body schema.
5. Add bearer authentication metadata.
6. Compare `/docs-json` with real curl responses.
7. Find and correct three deliberate documentation mismatches.
8. Decide production documentation exposure.

## Common Mistakes and Debugging Advice

- OpenAPI is the document; Swagger UI renders it.
- Documentation decorators do not enforce runtime behavior.
- Validation metadata and API descriptions serve different jobs.
- Document response envelopes exactly.
- Never put real secrets in examples.
- Mark authentication on the operations that require it.
- A security scheme does not install authorization.
- Track designed-but-unimplemented endpoints honestly.

## Review Questions

1. How do OpenAPI and Swagger UI differ?
2. What does `DocumentBuilder` define?
3. Why annotate DTO properties?
4. How should an envelope be documented?
5. What does `@ApiBearerAuth` do and not do?
6. Why inspect the JSON document?
7. What is documentation drift?
8. Why might production UI exposure be restricted?

## Completion Checklist

- [ ] Swagger module is installed and bootstrapped.
- [ ] Posts DTOs and operations are described.
- [ ] Envelopes, statuses, and errors match reality.
- [ ] Authentication metadata is present where required.
- [ ] Generated JSON is reviewed against live requests.
- [ ] Unimplemented contract items are labeled.
- [ ] All exercises and review questions are complete.

## Official References

- Nest OpenAPI introduction: https://docs.nestjs.com/openapi/introduction
- Nest OpenAPI types: https://docs.nestjs.com/openapi/types-and-parameters
- Nest OpenAPI operations: https://docs.nestjs.com/openapi/operations
- OpenAPI specification: https://spec.openapis.org/oas/latest.html

## What to Send for Review

Send Swagger bootstrap, annotated DTOs/controller, generated JSON, contract comparison, exposure decision, exercises, and review answers. Next: **Day 66 — Relational Database Concepts**.
