# Day 92 — What to Test: Testing Pyramid and Jest in Nest

> Core lesson: about 75–90 minutes. Design a test portfolio around risks, not line count.

## Learning Objectives

- distinguish unit, integration, and end-to-end tests;
- select valuable behaviors and boundaries;
- configure deterministic Jest projects/scripts;
- recognize brittle or low-value tests.

## 0–20 Minutes — The Portfolio

Use many fast unit tests for policies and transformations, fewer integration tests for Nest wiring/database adapters, and a small set of E2E journeys for HTTP contracts. The pyramid is a cost model, not a required ratio.

Prioritize authorization, money/data loss equivalents, migrations, validation, error mapping, state transitions, and past bugs. Do not test framework decorators merely to prove Nest works.

## 20–40 Minutes — Test Structure

Use Arrange–Act–Assert and name observable behavior:

```ts
it("rejects an author updating another author's post", async () => {
  // arrange identities and stored record
  // act on the use case
  // assert forbidden result and no write
});
```

Test public contracts instead of private method calls. One behavior per test makes failures diagnostic. Avoid real time, randomness, network, and shared global state unless that boundary is intentionally under test.

## 40–65 Minutes — Jest in the Project

Keep separate scripts/config when environments differ:

```json
{
  "scripts": {
    "test": "jest --runInBand",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config test/jest-e2e.json --runInBand"
  }
}
```

Match the project's module system and TypeScript transformer. Make tests discoverable consistently (`*.spec.ts`, `*.e2e-spec.ts`). Run one deliberate failure to learn the output, then restore it.

## Exercises

1. Classify ten blog behaviors by test layer.
2. Write a risk-ranked test plan.
3. Replace one implementation-detail assertion with an outcome assertion.
4. Identify sources of nondeterminism and their seams.
5. Measure the empty/small suite runtime.

## Completion Checklist

- [ ] Test layers and their costs are understood.
- [ ] High-risk blog behaviors are prioritized.
- [ ] Unit and E2E scripts are separated.
- [ ] Tests are deterministic and behavior-named.
- [ ] Framework internals are not redundantly tested.

## Official Reference

- [Nest testing fundamentals](https://docs.nestjs.com/fundamentals/testing)

