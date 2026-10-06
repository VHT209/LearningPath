# syntax=docker/dockerfile:1

# uv's official image: system CPython 3.13 + uv, both preinstalled.
# Pinned to an immutable digest -- the ":tag" is kept only so a human can
# read what the digest points at; resolution is by digest alone.
#   tag at pin time: python3.13-bookworm-slim
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim@sha256:531f855bda2c73cd6ef67d56b733b357cea384185b3022bd09f05e002cd144ca

# --- non-root identity -------------------------------------------------------
# Fixed high UID/GID so:
#  - Kubernetes `runAsNonRoot` can prove the user is not 0
#  - it will not collide with a real account on a bind-mounted host path
RUN groupadd --gid 10001 app \
 && useradd  --uid 10001 --gid 10001 --no-log-init --create-home --shell /usr/sbin/nologin app

WORKDIR /app
RUN chown app:app /app
USER app

# UV_PYTHON_PREFERENCE=only-system + UV_PYTHON_DOWNLOADS=never:
#   build the venv against the image's /usr/local Python; never fetch a
#   uv-managed interpreter. The default ("managed") downloads CPython into
#   /root/.local -- unreadable after we drop to uid 10001, and dead weight.
# UV_NO_CACHE=1: do not bake uv's wheel cache into the layer.
ENV UV_NO_CACHE=1 \
    UV_PYTHON_DOWNLOADS=never \
    UV_PYTHON_PREFERENCE=only-system \
    PYTHONPATH=/app/src \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH=/app/.venv/bin:$PATH

# --- dependency layer ------------------------------------------------------
# Only the manifests. This layer -- the expensive one -- is reused until
# pyproject.toml or uv.lock actually change, no matter what happens in src/.
# --no-install-project: install third-party deps only (no source yet).
# --no-dev: skip the [dependency-groups] dev set (pytest, pre-commit,
#   virtualenv, ruff, httpx) -- test/build tooling is not runtime code.
COPY --chown=app:app pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# --- application layer ---------------------------------------------------
COPY --chown=app:app src ./src
RUN uv sync --frozen --no-dev

EXPOSE 8000

# Run uvicorn straight from the venv: no `uv run` at boot means no lockfile
# re-check and nothing from uv's toolchain in the running process.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
