# Day 93 — Unit Tests: Services and Controllers

> Core lesson: about 90 minutes. Test policies and orchestration with typed fakes and no database.

## Learning Objectives

- build a Nest testing module with replaced dependencies;
- test service success, denial, and collaboration behavior;
- test controller delegation and HTTP-facing behavior;
- avoid mocks that merely reproduce implementation.

## 0–25 Minutes — Service Harness

```ts
const postsRepo: jest.Mocked<PostsRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySlug: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const module = await Test.createTestingModule({
  providers: [
    PostsService,
    { provide: POSTS_REPOSITORY, useValue: postsRepo },
    { provide: CLOCK, useValue: { now: () => fixedNow } },
  ],
}).compile();
```

Reset mocks before each test. Use builders for principals/posts so setup stays readable without hiding important differences.

## 25–55 Minutes — Valuable Service Cases

Test publish ownership/admin override, incomplete draft rejection, timestamp from the clock, repository not called after denial, error translation, and tag replacement transaction orchestration. Assert returned outcome first; assert collaborator calls only when they are part of the contract.

Do not mock Prisma chains inside domain service tests. Mock the repository port. Prisma adapter behavior belongs in integration tests.

## 55–75 Minutes — Controller Tests

Instantiate a controller through `Test.createTestingModule` with a mocked service. Verify parsed/typed values are delegated and responses are mapped. Pipes/guards/decorators are not fully exercised by direct controller calls; test their real HTTP composition on Days 95–96.

## Practice

1. Test owner, other author, reader, admin, and missing post.
2. Prove a denied mutation performs no repository write.
3. Test the `CurrentUser` value reaches the service.
4. Test 204 controller methods return no payload.
5. Remove any assertion tied only to method order without business meaning.

## Completion Checklist

- [ ] Unit tests require no database/network.
- [ ] Time and persistence have controllable seams.
- [ ] Authorization branches are covered.
- [ ] Denied operations prove absence of writes.
- [ ] Controller-test limitations are documented.

## Official Reference

- [Nest unit testing](https://docs.nestjs.com/fundamentals/unit-testing)

