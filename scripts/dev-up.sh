#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"

echo "==> Starting PostgreSQL, Redis, API, Celery (Docker)..."
cd "${BACKEND_DIR}"

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "    Created backend/.env from .env.example"
fi

docker compose up -d --build

echo "==> Waiting for API health..."
for _ in $(seq 1 40); do
  if curl -sf "http://localhost:8000/health" >/dev/null 2>&1; then
    echo "    API is up: http://localhost:8000"
    break
  fi
  sleep 2
done

if ! curl -sf "http://localhost:8000/health" >/dev/null 2>&1; then
  echo "    API did not become healthy. Check: docker compose -f backend/docker-compose.yml logs backend"
  exit 1
fi

echo "==> Installing frontend dependencies (if needed)..."
cd "${FRONTEND_DIR}"
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "    Created frontend/.env from .env.example"
fi
npm install

echo ""
echo "Local stack:"
echo "  API:       http://localhost:8000"
echo "  API docs:  http://localhost:8000/docs"
echo "  Postgres:  localhost:5433 (user/password/db: sigma)"
echo "  Redis:     localhost:6380"
echo ""
echo "Start frontend in another terminal:"
echo "  cd frontend && npm run dev"
echo "  App UI:    http://localhost:5173"
