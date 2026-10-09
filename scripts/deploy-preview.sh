#!/usr/bin/env bash
# Deploy a Cloudflare Worker Preview for the current branch / PR.
# Usage:
#   pnpm run preview
#   pnpm run preview -- --name pr-42
#   pnpm run preview -- --json
#   PREVIEW_MESSAGE="fix IPC card" pnpm run preview
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

has_flag() {
  local flag="$1"
  shift
  for arg in "$@"; do
    case "$arg" in
      "$flag"|"$flag"=*) return 0 ;;
    esac
  done
  return 1
}

# pnpm may forward a literal `--` before user flags; drop it.
if [[ "${1:-}" == "--" ]]; then
  shift
fi

TAG="${PREVIEW_TAG:-}"
if [[ -z "$TAG" ]]; then
  TAG="$(git rev-parse --short HEAD 2>/dev/null || echo local)"
fi

MESSAGE="${PREVIEW_MESSAGE:-}"
if [[ -z "$MESSAGE" ]]; then
  MESSAGE="$(git log -1 --pretty=%s 2>/dev/null || echo "Preview deploy")"
fi

echo "==> Building production bundle"
pnpm run build

WRANGLER_ARGS=()
if ! has_flag --tag "$@"; then
  WRANGLER_ARGS+=(--tag "$TAG")
fi
if ! has_flag --message "$@"; then
  WRANGLER_ARGS+=(--message "$MESSAGE")
fi
WRANGLER_ARGS+=("$@")

echo "==> Deploying Worker Preview (wrangler preview)"
# Extra args after `--` are forwarded, e.g. --name pr-123 --json
exec pnpm exec wrangler preview "${WRANGLER_ARGS[@]}"
