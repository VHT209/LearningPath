# syntax=docker/dockerfile:1

# ---- build stage: Bun installs deps and runs `next build` ----------------
# Pinned by digest.  tag at pin time: 1  (Bun 1.x, Debian-based)
FROM oven/bun:1@sha256:5ff609364c049b54eb0ff560ec96319729a972078ef2c755d758f0c6ef89c2d6 AS builder
WORKDIR /app

# oven/bun ships a non-root `bun` user (uid 1000). Build as it so package
# lifecycle scripts never run as root and /app is writable without root.
RUN chown bun:bun /app
USER bun

# Dependency layer: only the manifests, so `bun install` is reused until
# package.json / bun.lock change.
COPY --chown=bun:bun package.json bun.lock ./
RUN bun install --frozen-lockfile

# Source + production build. next.config.ts sets output:"standalone",
# so this emits a self-contained server under .next/standalone.
COPY --chown=bun:bun . .
RUN bun run build

# ---- runtime stage: plain Node runs the standalone server ---------------
# The standalone server is a Node program -- Bun is not needed to run it.
# node:20-alpine ships a non-root `node` user (uid 1000). Pinned by digest.
#   tag at pin time: 20-alpine
FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
WORKDIR /app

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# The three artifacts the standalone server needs, owned by the runtime user:
#   .next/standalone -> server.js + Next's traced minimal node_modules
#   .next/static     -> content-hashed client bundles the server serves
#   public           -> static assets
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node
EXPOSE 3000
CMD ["node", "./server.js"]
