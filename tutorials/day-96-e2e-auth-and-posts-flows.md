# Day 96 — E2E: Authentication and Posts Flows

> Core lesson: about 90–120 minutes. Prove the highest-risk user journeys through real HTTP and PostgreSQL.

## Learning Objectives

- create test users through public behavior or controlled fixtures;
- carry bearer tokens across multi-request journeys;
- test authentication, roles, ownership, and publication visibility;
- assert both HTTP results and important persisted effects.

## 0–25 Minutes — Auth Journey

Test registration → login → protected request. Assert status, safe response shape, token presence, and that neither plaintext nor hash appears. Add duplicate registration, wrong password, missing/malformed/expired token, and generic credential errors.

Use unique emails per test. A small helper may register/login, but keep failures readable and never bypass the password flow in every auth test.

## 25–60 Minutes — Posts Journey

1. register/login two authors, reader, and admin;
2. author A creates a draft;
3. anonymous and reader cannot see the draft;
4. author B cannot update/publish/delete it;
5. author A edits and publishes it;
6. public list/detail now show only safe fields;
7. admin can moderate/manage according to policy.

Assert 401 versus 403 versus 404 deliberately. Try sending `authorId`, `role`, `status`, and timestamps in bodies to prove whitelist/mass-assignment protection.

## 60–80 Minutes — Stable Assertions

Assert contract-relevant fields, not whole volatile objects. Validate timestamp format without exact wall-clock values unless a fake clock is injected. Query the database only when proving a side effect that HTTP cannot reveal, such as stored password hash or absence of a denied write.

## Exercises

1. Add slug collision and republish cases.
2. Add category/tag assignment permissions.
3. Prove a denied request changes no row.
4. Test pagination boundaries with created posts.
5. Make failure output identify actor/action/resource clearly.

## Completion Checklist

- [ ] Registration/login failures and success are covered.
- [ ] Tokens cross real protected HTTP requests.
- [ ] Ownership matrix is tested end to end.
- [ ] Draft/published visibility is proven.
- [ ] Mass-assignment attempts fail safely.

