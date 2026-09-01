# Day 104 — Docker Fundamentals and an API Dockerfile

> Core lesson: about 90–120 minutes. Package the compiled API into a reproducible, non-root, multi-stage image.

## Learning Objectives

- distinguish image, container, layer, volume, and network;
- write a multi-stage Node Dockerfile;
- keep secrets and unnecessary files out of build context/image;
- run and inspect the production container.

## 0–20 Minutes — Mental Model

An image is immutable filesystem/config; a container is a running instance. Layers cache build steps. Volumes persist data outside container lifecycle. Networks provide service discovery. A container is isolation, not a full security boundary.

## 20–55 Minutes — Multi-Stage Build

Adapt paths and the Node version required by Prisma 8:

```dockerfile
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

Use a pinned supported base image/digest policy. Add `.dockerignore` for `.git`, `node_modules`, `dist`, coverage, local env files, logs, and editor artifacts. Never bake `.env` or tokens into `ARG`/layers.

## 55–80 Minutes — Build and Inspect

```bash
docker build -t blog-api:local .
docker run --rm -p 3000:3000 --env-file .env blog-api:local
```

Pass secrets only at runtime. Confirm non-root user, listening on `0.0.0.0`, health endpoint, shutdown on SIGTERM, image contents, and absence of secret/local files. Container logs go to stdout/stderr.

## Exercises

1. Explain each layer and cache invalidation.
2. Compare image sizes before/after multi-stage build.
3. inspect user/process/environment without printing secrets;
4. rebuild after only source changes and observe caching;
5. test SIGTERM and clean database shutdown.

## Completion Checklist

- [ ] Clean Docker build succeeds.
- [ ] Runtime image starts compiled JS as non-root.
- [ ] Secrets are absent from context/image/history.
- [ ] Required Prisma artifacts are present.
- [ ] Health and graceful shutdown work.

## Official Reference

- [Docker Node.js guide](https://docs.docker.com/guides/nodejs/)

