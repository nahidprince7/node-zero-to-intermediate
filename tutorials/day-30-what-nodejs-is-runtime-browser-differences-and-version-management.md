# Day 30 — What Node.js Is: Runtime, Browser Differences, Use Cases, and Version Management

> Core lesson: about 60 minutes. This begins the Node.js phase by separating the JavaScript language from the environment that executes it.

## Learning Objectives

You will learn to:

- distinguish JavaScript, TypeScript, Node.js, and a browser;
- explain what a runtime provides;
- identify important Node and browser API differences;
- recognize workloads that fit Node well;
- explain the event-loop concurrency model without overstating it;
- select and record an LTS Node version with `nvm`.

## Prerequisites

Complete the TypeScript phase through Day 29. Check the current environment:

```bash
node --version
npm --version
command -v node
```

## 0–12 Minutes — Language Versus Runtime

JavaScript defines syntax and language behavior: variables, functions, objects, promises, and more. A runtime executes that language and supplies host APIs.

- A browser supplies the DOM, `window`, navigation, storage, and web-page events.
- Node.js supplies server and operating-system APIs such as files, processes, networking, streams, and buffers.
- TypeScript checks and transforms source before a JavaScript runtime executes it.
- npm installs packages and runs project scripts; npm is not the runtime.

Create `practice/day-30/runtime.js`:

```js
console.log({
  nodeVersion: process.version,
  platform: process.platform,
  architecture: process.arch,
  workingDirectory: process.cwd(),
});
```

Run it:

```bash
node practice/day-30/runtime.js
```

`process` is supplied by Node. It is not part of the JavaScript language itself.

## 12–25 Minutes — Node and Browser Environments

| Need | Browser environment | Node.js environment |
|---|---|---|
| Global reference | `globalThis` and commonly `window` | `globalThis`; Node-specific globals also exist |
| Page elements | DOM APIs such as `document` | No DOM by default |
| File-system access | Restricted browser mechanisms | `node:fs` with operating-system permissions |
| Process information | No Node `process` object | `process` |
| Binary data | `ArrayBuffer`, typed arrays, `Blob` | Those plus Node's `Buffer` |
| Modules | Browser ESM | ESM and CommonJS support |

Both modern environments share many web-platform APIs, including promises, URL APIs, timers, and `fetch`. Never decide availability from language syntax alone; check the target runtime's documentation and supported version.

Try feature detection:

```js
console.log({
  hasFetch: typeof fetch === "function",
  hasProcess: typeof process === "object",
  hasDocument: typeof document === "object",
});
```

`typeof` is used so checking a missing global does not itself throw.

## 25–38 Minutes — What Node Is Good At

Node is a strong fit for:

- HTTP APIs and web servers;
- real-time network services;
- command-line tools and build tooling;
- automation scripts;
- applications that spend much of their time waiting for files, networks, or databases;
- teams sharing JavaScript or TypeScript knowledge across client and server.

Node is not automatically the best choice for every task. Long CPU-heavy JavaScript work can block the event loop and delay other requests. Native tools, worker threads, child processes, queues, or a different platform may be better depending on the workload. Measure before making performance claims.

The framework does not decide this: Express and NestJS run on top of Node, so the runtime constraints still matter.

## 38–48 Minutes — Concurrency Mental Model

In a typical Node process, your JavaScript callback code runs on the main event-loop thread. Node can ask the operating system or its supporting worker pool to perform certain I/O and other operations. When results become ready, callbacks or Promise continuations are scheduled for JavaScript to handle.

This enables many in-flight I/O operations without creating one JavaScript thread per request. It does not mean:

- all code runs in parallel;
- CPU-heavy loops are harmless;
- every API uses the same internal mechanism;
- asynchronous code is automatically fast.

Days 13–17 supplied the Promise mental model. Days 35–39 will connect it to Node events, streams, and HTTP.

## 48–60 Minutes — Manage Node Versions with `nvm`

Node releases have different support states. For a learning backend, choose an active LTS line unless the project requires something else.

If `nvm` is already installed:

```bash
nvm --version
nvm ls
nvm install --lts
nvm use --lts
node --version
```

Do not run a remote installation script blindly. If `nvm` is missing, use the installation instructions linked from Node's official download page, inspect the command, and restart or reload the shell as instructed.

Record the selected major version in `practice/day-30/.nvmrc`. For example, if the chosen LTS major is 24:

```text
24
```

Then the project can be selected with:

```bash
cd practice/day-30
nvm use
```

Optionally communicate the supported range in `package.json`:

```json
{
  "engines": {
    "node": ">=24 <25"
  }
}
```

The `engines` field communicates compatibility; depending on npm configuration, it may warn rather than enforce. The lockfile does not install Node itself.

## Guided Practice — Runtime Inspector

Build a small script that prints:

1. Node, V8, and npm-related version information available to the process;
2. platform and CPU architecture;
3. current working directory and script arguments;
4. whether `fetch`, `Buffer`, `document`, and `window` exist;
5. a clear message explaining that missing browser globals are expected.

Run it from two different working directories and explain which values change.

## Independent Exercises

1. Classify ten APIs as JavaScript-language, browser-host, Node-host, or shared.
2. Explain the roles of Node, V8, TypeScript, and npm in one sentence each.
3. Find one Node API unavailable in a browser and one web API available in Node.
4. Describe two workloads suited to Node and one that needs special care.
5. Write a blocking loop, observe its effect on a timer, then remove it.
6. Install or select the current active LTS through `nvm`.
7. Add `.nvmrc`, switch away if another version is installed, and switch back.
8. Record the supported Node range in `package.json` and explain its limit.

## Common Mistakes and Debugging Advice

- JavaScript is the language; Node is one runtime for it.
- TypeScript does not replace Node at runtime after normal compilation.
- Node has no DOM unless a library deliberately supplies one.
- Do not describe Node as “single-threaded” without the event-loop nuance.
- Async I/O does not make CPU-heavy JavaScript non-blocking.
- Prefer an active LTS release for ordinary production learning projects.
- Verify `node --version` after switching shells or projects.
- `.nvmrc` records intent; teammates still need a compatible version manager.

## Review Questions

1. What does a runtime add to the JavaScript language?
2. How do TypeScript, Node, and npm differ?
3. Why does browser code using `document` fail in Node?
4. Which APIs are shared across modern Node and browsers?
5. Why is Node effective for I/O-heavy services?
6. What can block the event loop?
7. Why choose an active LTS line?
8. What do `.nvmrc` and `engines.node` each communicate?

## Completion Checklist

- [ ] The runtime inspector runs and its output is explained.
- [ ] Language and host APIs are distinguished.
- [ ] Node use cases and CPU caveats are understood.
- [ ] An active LTS version is selected with `nvm`.
- [ ] `.nvmrc` and optional engine range agree.
- [ ] All exercises and review questions are complete.

## Official References

- Introduction to Node.js: https://nodejs.org/en/learn/getting-started/introduction-to-nodejs
- Node.js downloads and release status: https://nodejs.org/en/download
- Node.js API documentation: https://nodejs.org/api/
- `nvm` project: https://github.com/nvm-sh/nvm

## What to Send for Review

Send the runtime inspector, output from both directories, Node/npm/nvm versions, `.nvmrc`, `package.json`, the API classification, and review answers. Next: **Day 31 — npm, `package.json`, Dependencies, Scripts, and Semantic Versioning**.
