#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
IMG_DIR="${HOME}/Desktop/сигма_вебсайт"

if [[ -z "${SIGMA_ADMIN_TOKEN:-}" ]]; then
  echo "Export SIGMA_ADMIN_TOKEN with an admin JWT before running."
  exit 1
fi

if [[ ! -d "${IMG_DIR}" ]]; then
  echo "Image folder not found: ${IMG_DIR}"
  exit 1
fi

echo "==> DB migration (cover_image_key)..."
cd "${BACKEND_DIR}"
docker compose exec -T db psql -U sigma -d sigma -v ON_ERROR_STOP=1 <<'SQL'
ALTER TABLE course ADD COLUMN IF NOT EXISTS cover_image_key TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS avatar_image_key TEXT;
SQL

echo "==> Rebuild backend (new /courses/{id}/cover endpoint)..."
docker compose up -d --build backend

echo "==> Wait for API..."
for _ in $(seq 1 40); do
  if curl -sf "http://localhost:8000/health" >/dev/null; then
    break
  fi
  sleep 2
done

if ! curl -sf "http://localhost:8000/openapi.json" | grep -q '"/courses/{course_id}/cover"'; then
  echo "Cover endpoint still missing. Check: docker compose logs backend"
  exit 1
fi

echo "==> Upload covers from ${IMG_DIR}..."
export SIGMA_API_URL="${SIGMA_API_URL:-http://localhost:8000}"
python3 "${ROOT_DIR}/scripts/upload-course-covers.py" --publish

echo "==> Apply DB keys if upload used API only (optional)..."
echo "Done. Open http://127.0.0.1:5173/courses as a student and pick a course per slot to see covers."
