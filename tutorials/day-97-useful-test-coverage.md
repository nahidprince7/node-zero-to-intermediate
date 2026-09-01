# Day 97 — Coverage: Useful Signal, Not Theatre

> Core lesson: about 75 minutes. Use coverage to find blind spots without optimizing for a vanity percentage.

## Learning Objectives

- interpret statement, branch, function, and line coverage;
- locate important untested behavior;
- set pragmatic thresholds;
- avoid tests written only to execute lines.

## 0–20 Minutes — Read the Report

Run `npm run test:cov`. Statements/lines show executed code; branches reveal untested alternatives; functions show uncalled functions. Branch gaps in authorization, error mapping, and state transitions are usually more important than uncovered generated/bootstrap code.

Exclude generated Prisma artifacts, migrations, declaration files, and trivial entrypoints only with written reasons. Do not exclude difficult business code to improve the number.

## 20–45 Minutes — Risk First

Inspect uncovered lines and ask:

- Could this leak data or bypass authorization?
- Could it corrupt/delete data?
- Is it an expected failure path?
- Has it broken before?
- Is another test layer a better place?

Add tests for meaningful outcomes: admin/owner branches, transaction rollback, expired token, duplicate constraints, hidden-content filters. Ignore unreachable defensive branches only after proving/documenting why.

## 45–60 Minutes — Thresholds

Set modest repository thresholds that the current suite genuinely meets, then raise them with behavior—not empty assertions. Per-file thresholds can protect critical policy modules. A global 100% requirement often encourages brittle, low-value tests and slows refactoring.

Coverage does not measure assertion quality, missing requirements, concurrency, production configuration, or security correctness.

## Practice

1. Find the riskiest uncovered branch and test it.
2. Mutation-test one condition manually and ensure a test fails.
3. Explain every coverage exclusion.
4. Compare unit-only versus all-layer reports.
5. Record suite duration with coverage on/off.

## Completion Checklist

- [ ] Coverage artifacts are generated and ignored by Git.
- [ ] Critical branch gaps have behavior tests.
- [ ] Exclusions have legitimate reasons.
- [ ] Thresholds are achievable and enforced in CI.
- [ ] Coverage percentage is not treated as correctness proof.

## Official Reference

- [Jest coverage configuration](https://jestjs.io/docs/configuration#collectcoverage-boolean)

