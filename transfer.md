# Session transfer notes

**To the next agent: read this, act on it as needed, then delete this file.**
It is a handoff for uncommitted work — not a permanent doc.

---

## TL;DR

Kubernetes-deployability work (5 pieces) is done but **100% uncommitted working-tree
changes** — nothing staged, nothing committed. The user wanted to test before committing.

- Branch: `enhancement/k8s-deploy` (already created; matches their PR-from-`enhancement/*` workflow).
- `origin` = `https://github.com/Spring-2026-CompE-561/Learning-Path-Generator.git`, `main` at `5c9f62fe`.
- This session: read + deleted the previous `transfer.md`, then the user asked to `git commit`.
  Staging was **interrupted before any `git add`** while the user asked design questions.
  Nothing was staged or committed this session.
- Separately, the user asked about auth on `GET /learning-paths/{id}` — there is a real
  **IDOR / BOLA bug** there (details in its own section below). NOT fixed, NOT part of the k8s work.

---

## The k8s work — files this work touched (stage ONLY these)

### 1. Frontend API base URL -> relative path + dev proxy
14 `fetch("http://127.0.0.1:8000/...")` call sites -> `fetch("/api/...")`:
- `frontend/src/app/(auth)/layout.tsx`
- `frontend/src/app/(auth)/dashboard/page.tsx`
- `frontend/src/app/(auth)/learning-path/[id]/page.tsx`
- `frontend/src/app/(auth)/schedule/page.tsx`
- `frontend/src/components/useprofile.tsx`
- `frontend/src/components/ui/learning-path-form.tsx`
- `frontend/src/components/ui/login-form.tsx`
- `frontend/src/components/ui/signin-form.tsx`
- `frontend/next.config.ts` — added dev-only `rewrites()`: `/api/:path*` -> `http://127.0.0.1:8000/:path*`,
  returns `[]` when `NODE_ENV !== "development"`. In-cluster an Ingress does this instead.

### 2. `GET /health`
- `backend/src/app/routes/health.py` (NEW, untracked) — unauthenticated, runs `SELECT 1`,
  `200 {"status":"ok"}` / `503 {"status":"unavailable"}`, `include_in_schema=False`.
- `backend/src/app/main.py` — imports `health_router`, `app.include_router(health_router)` (registered first).

### 3. Missing `DATABASE_URL` fails at startup
- `backend/src/app/core/settings.py` — `database_url` default `"sqlite:///./learning_paths.db"` -> `""`;
  after `settings = Settings()`, raises `RuntimeError` if blank. No more silent SQLite fallback.
- `backend/src/app/tests/unit_tests/conftest.py` — added
  `os.environ.setdefault("DATABASE_URL", TEST_DATABASE_URL)` before `from app.main import app`,
  or the new guard aborts test collection.

### 4. Dockerfile hardening
- `backend/Dockerfile` — full rewrite: base pinned by digest
  (`ghcr.io/astral-sh/uv:python3.13-bookworm-slim@sha256:531f855b...`, bumped 3.12->3.13 to match
  `backend/.python-version`), non-root user `app` uid/gid 10001,
  `UV_PYTHON_PREFERENCE=only-system` + `UV_PYTHON_DOWNLOADS=never`, `uv sync --no-dev`,
  `CMD` runs `uvicorn` straight from `/app/.venv/bin` (no `uv run` at boot).
- `frontend/Dockerfile` — full rewrite: both stages digest-pinned
  (`oven/bun:1@sha256:5ff60936...`, `node:20-alpine@sha256:fb4cd12c...`), `USER bun` in build,
  `USER node` in runtime, `COPY --chown` throughout.

### 5. `k8s/` (NEW, untracked) — 8 plain-YAML manifests, apply in filename order
`00-namespace` (PSA restricted) · `10-configmap` · `20-secret` (TEMPLATE, placeholder values) ·
`30-postgres` (ClusterIP Service + StatefulSet + volumeClaimTemplate) · `40-backend`
(Service + Deployment, 2 replicas, wait-for-postgres initContainer) · `50-frontend` (Service + Deployment) ·
`60-ingress` (`/api`->backend, `/`->frontend, ingress-nginx rewrite) · `70-networkpolicy`
(only `app=backend` reaches Postgres + default-deny-ingress + ingress-controller allow + DNS egress).

### Incidental
- `backend/.env` was created from `backend/.env.example` for a compose test. **DO NOT COMMIT IT.** Leave untracked.
- `docker compose` stack was brought **down** at end of the earlier session (`pgdata` volume retained).

---

## Separate bug found this session: IDOR / BOLA on learning-path read

**Not touched. Decide separately from the k8s PR.**

- `backend/src/app/routes/learning_path.py:44` `get_using_specfic` resolves `current_user` but
  never uses it; calls `learning_path_service.get_by_id_with_details(db, learning_path_id)`.
- `backend/src/app/services/learning_path.py:30` `get_by_id_with_details` only raises 404 if the
  row is missing — no `user_id` comparison.
- **Effect:** any logged-in user can `GET /learning-paths/{any_id}` and read another user's full
  path (topic, weekly plans, resources). `200 OK`. Code comment at line 41 already flags it as a TODO.
- Inconsistent within the same file: `PUT` (line ~138) and `DELETE` (line ~161) both do
  `if learning_path.user_id != user_id: raise 403`. `GET` list is scoped to `current_user.id`.
  Only the single-item `GET` is unguarded.
- **Concept:** IDOR / Broken Object Level Authorization (OWASP API #1) — authn present, object-level
  authz missing.
- **Fix direction:** pass `current_user.id` into `get_by_id_with_details`, compare `user_id`,
  prefer raising **404** (not 403) for non-owned rows so ID existence isn't leaked. Check the
  `weekly_plan` and `resource` GET-by-id routes for the same pattern.

---

## Verification already done (earlier session, still valid)

- Both images build clean (`docker compose build`).
- Backend hardened image via `docker run` (no compose overrides): `uid=10001(app)`,
  venv python -> `/usr/local/bin/python3.13`, `GET /health` -> 200, DB stopped -> 503, DB back -> 200.
- Frontend hardened image via `docker run`: `uid=1000(node)`, Next.js ready, `GET /` -> 200.
- Image sizes: backend **376 MB** (was 437), frontend **271 MB**.
- `k8s/*.yaml` parse clean. **NOT server-validated** — no cluster reachable from the dev box.
  First real check: `kubectl apply -f k8s/ --dry-run=server` on the user's cluster.

---

## Known issues / gotchas (do not re-discover)

1. **CRLF churn.** ~55 files show modified in `git status` from a **pre-session LF->CRLF
   conversion** unrelated to this work. `git add -A` would bundle a ~6800-line whitespace diff
   into the PR. Stage ONLY the explicit list above. Files that show modified but are almost
   certainly just CRLF churn (do NOT stage): `frontend/src/app/layout.tsx` (note: the *root*
   layout, not `(auth)/layout.tsx`), `backend/src/app/tests/unit_tests/learning_path/conftest.py`,
   `.../resources/conftest.py`, `.../weekly_plan/conftest.py`. Untracked but not ours:
   `backend/.gitignore`, `node_modules/`. `git diff` on this WSL/Windows mount is slow — 2 min timeouts expected.

2. **Hardened backend image vs `docker-compose.yml`.** Compose bind-mounts `./backend:/app` + an
   anon volume over `/app/.venv`, masking the baked venv. New `CMD` is `uvicorn` (not `uv run`),
   so `docker compose up backend` fails: `exec /app/.venv/bin/uvicorn: no such file or directory`.
   Fix = delete the two `volumes:` lines from the `backend` service in `docker-compose.yml`
   (loses hot-reload). **Not applied** — user's call. K8s path unaffected.

3. **Compose can't fully test `/api` routing.** Prod frontend container doesn't run the dev
   rewrite and compose has no Ingress, so `/api/*` 404s under `docker compose up`. Test `/api`
   via `bun run dev` (dev rewrite active) or in k8s.

4. **Backend tests need a specific DB.** `conftest.py` hardcodes
   `postgresql+psycopg://learning_app:12345678@localhost:5432/learning_paths_test`
   (password `12345678`, differs from compose's `dev_password_123`). Pre-existing, not from this work.

---

## Suggested next steps (user has NOT done these)

**Test (cheap -> thorough):**
1. `cd backend && uv run pytest src/app/tests/ -v` (needs test Postgres, see gotcha 4)
2. Backend `/health` on hardened image via `docker run` against `docker compose up -d db`
3. `cd frontend && bunx tsc --noEmit && bun run lint && bun run build`
4. `/api` end-to-end: A `cd backend && uv run fastapi dev src/app/main.py`,
   B `cd frontend && bun run dev`, then sign up / log in / create path / log out in the browser.
   Or `cd frontend && bun run test:e2e` (Playwright, needs both running).
5. `kubectl apply -f k8s/ --dry-run=server` on the kubeadm cluster.

**Commit:**
- Already on `enhancement/k8s-deploy`.
- `git add` the explicit file list above (NOT `-A`, NOT `backend/.env`, NOT the CRLF-churn files).
- commit + PR. Keep the IDOR fix out of this PR unless the user asks to fold it in.

**Before any real k8s deploy (prereqs the manifests assume):**
- Policy-capable CNI — Flannel does NOT enforce NetworkPolicy (silent no-op). Need Calico/Cilium/Antrea/Weave.
- `ingress-nginx` installed (bare metal -> NodePort, or MetalLB for a LoadBalancer IP).
- StorageClass named `local-path` (Rancher local-path-provisioner) or edit `30-postgres.yaml`.
- Load images onto every node (no registry): `docker save ... | sudo ctr -n k8s.io images import -`.
  Manifests use `learning-path-backend:latest` / `learning-path-frontend:latest` with
  `imagePullPolicy: IfNotPresent` — retag builds or edit manifests.
- Put real values in `k8s/20-secret.yaml` (or `kubectl create secret`).
- `DATABASE_URL` is assembled in `40-backend.yaml` from ConfigMap + Secret via `$(VAR)`
  interpolation; the assembled URL (with password) is visible in `kubectl describe pod` — known tradeoff.

---

## Reference: pinned digests (in the files; listed for convenience)

| image | digest |
|---|---|
| `ghcr.io/astral-sh/uv:python3.13-bookworm-slim` | `sha256:531f855bda2c73cd6ef67d56b733b357cea384185b3022bd09f05e002cd144ca` |
| `oven/bun:1` | `sha256:5ff609364c049b54eb0ff560ec96319729a972078ef2c755d758f0c6ef89c2d6` |
| `node:20-alpine` | `sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293` |
| `postgres:16-alpine` | `sha256:cf78e76683b9ca8c5733cbbdce6c9262b45b6767934dd0a95e671f9a0fc20685` |
| `busybox:1.37` | `sha256:9db7b59979c38555a39def84a31fb98b5296952f9e3afd4f6f11f05b07adfab0` |
