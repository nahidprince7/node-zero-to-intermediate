# Day 35 — Events and EventEmitter

> Core lesson: about 60–75 minutes. Use synchronous in-process events deliberately and understand their failure modes.

## Learning Objectives

- create, emit, and listen for named events;
- understand listener ordering and synchronous execution;
- remove listeners and avoid memory leaks;
- distinguish `EventEmitter` from queues and durable messaging.

## 0–15 Minutes — Why Events

Events let one part announce that something happened without directly calling every interested component. Node's `EventEmitter` is in-process and in-memory:

```js
import { EventEmitter } from "node:events";

const bus = new EventEmitter();

bus.on("post:published", (post) => {
  console.log(`Published ${post.slug}`);
});

bus.emit("post:published", { id: 1, slug: "node-events" });
```

`emit()` calls listeners synchronously in registration order. It returns after those listeners return; it does not automatically await promises returned by async listeners.

## 15–30 Minutes — `on`, `once`, and Cleanup

```js
function audit(post) {
  console.log({ event: "post.published", postId: post.id });
}

bus.on("post:published", audit);
bus.once("ready", () => console.log("ready once"));
bus.off("post:published", audit);
```

Keep the same function reference to remove a listener. Long-lived emitters plus repeatedly attached request listeners retain memory and trigger `MaxListenersExceededWarning`; increasing the limit does not fix a lifecycle bug.

## 30–45 Minutes — Errors and Async Work

An emitted `"error"` event with no listener throws and may terminate the process:

```js
bus.on("error", (error) => {
  console.error("event bus failure", error);
});
```

Exceptions from ordinary listeners propagate through `emit()`. Async listener rejection is not a durable retry system. For important email, audit, or publishing work that must survive crashes, use a database/outbox and queue later—not a bare emitter.

## 45–60 Minutes — Guided Practice

Build a `BlogEvents` emitter with `post:created`, `post:published`, and `comment:created`. Add logging and metrics listeners, one `once` startup listener, cleanup, and an error listener. Predict output order before running.

## Independent Exercises

1. Register three listeners and prove their order.
2. Remove only one listener.
3. Show `once` runs exactly once.
4. Demonstrate that an async listener is not awaited by `emit`.
5. Find and fix a listener leak in a loop.
6. Explain why an event emitter cannot replace a job queue.

## Common Mistakes

- Treating events as asynchronous automatically.
- Creating hidden global control flow with undocumented names/payloads.
- Attaching per-request listeners to a singleton without cleanup.
- Emitting `error` without a listener.
- Using in-memory events for work that must be durable.

## Review Questions

1. Are listeners called synchronously?
2. What is the difference between `on` and `once`?
3. Why must `off` receive the original function?
4. What happens to an unhandled `error` event?
5. When is a queue a better fit?

## Completion Checklist

- [ ] Named events are emitted and handled.
- [ ] Listener order and async behavior are demonstrated.
- [ ] Listeners are removed safely.
- [ ] Error behavior is handled explicitly.
- [ ] In-process events are not confused with durable messaging.

## Official Reference

- [Node.js Events API](https://nodejs.org/api/events.html)

