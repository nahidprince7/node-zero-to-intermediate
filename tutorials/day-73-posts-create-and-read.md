# Day 73 — Posts: Create and Read

> Core lesson: about 75–90 minutes. Implement the first real blog use cases with controlled response shapes.

## Learning Objectives

- validate create input separately from stored and returned data;
- create drafts for a known author;
- read lists and individual posts with appropriate visibility;
- return 201, 200, and 404 deliberately.

## 0–20 Minutes — DTO and Public Shape

```ts
export class CreatePostDto {
  @IsString() @Length(3, 160) title!: string;
  @IsString() @MinLength(1) body!: string;
  @IsOptional() @IsString() @MaxLength(300) excerpt?: string;
  @IsOptional() @IsInt() @IsPositive() categoryId?: number;
}
```

Do not accept `id`, `authorId`, `status`, `createdAt`, or `publishedAt` from this DTO. The server supplies identity and safe defaults. Define a response object that omits `passwordHash` and internal join rows.

## 20–40 Minutes — Create a Draft

For now pass a seeded author ID explicitly from the exercise; authentication replaces it on Day 82.

```ts
async create(authorId: number, dto: CreatePostDto) {
  const author = await this.users.findById(authorId);
  if (!author) throw new NotFoundException("Author not found");

  return this.posts.create({
    ...dto,
    authorId,
    slug: makeSlug(dto.title),
    status: "DRAFT",
  });
}
```

Slug collision handling belongs to Day 74. Today use unique test titles and keep slug generation a pure function.

## 40–60 Minutes — Read Without Leaking

Public list queries return only published posts. Admin/author previews will later use a separate policy-aware query.

```ts
const posts = await prisma.orm.Post
  .where({ status: "PUBLISHED" })
  .select("id", "title", "slug", "excerpt", "publishedAt")
  .orderBy((post) => post.publishedAt.desc())
  .take(20)
  .all();
```

Use the actual namespace exposed by `PrismaService`. Include a controlled author/category shape when needed; never return the entire user row.

## 60–75 Minutes — Controller Contract

```ts
@Post()
@HttpCode(HttpStatus.CREATED)
create(@Body() dto: CreatePostDto) { /* call service */ }

@Get()
findPublished() { /* list */ }

@Get(":slug")
findPublishedBySlug(@Param("slug") slug: string) { /* 404 if absent */ }
```

Test valid creation, invalid DTOs, public list visibility, known slug, and unknown slug. Confirm drafts never appear publicly.

## Exercises

1. Add an excerpt fallback without mutating the request DTO.
2. Select only safe author fields.
3. Prove a draft URL returns 404 to a public caller.
4. Write table-driven tests for title and body validation.
5. Document all endpoints in Swagger.

## Completion Checklist

- [ ] Valid input creates a draft with server-owned fields.
- [ ] Invalid input returns the Day 63 error shape.
- [ ] Public reads expose only published posts.
- [ ] Unknown or non-public slugs return 404.
- [ ] No password hash can enter a response.

