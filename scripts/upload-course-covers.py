#!/usr/bin/env python3
"""Upload course cover images from Desktop folder via Sigma API."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

DEFAULT_IMG_DIR = Path.home() / "Desktop" / "сигма_вебсайт"
DEFAULT_API = os.environ.get("SIGMA_API_URL", "http://localhost:8000")


def api_request(
    method: str,
    url: str,
    token: str,
    *,
    data: dict | None = None,
    file_path: Path | None = None,
) -> tuple[int, dict | str]:
    headers = {"Authorization": f"Bearer {token}"}
    if file_path is not None:
        boundary = "----SigmaUploadBoundary"
        content = file_path.read_bytes()
        body = b"".join(
            [
                f"--{boundary}\r\n".encode(),
                f'Content-Disposition: form-data; name="file"; filename="{file_path.name}"\r\n'.encode(),
                b"Content-Type: image/png\r\n\r\n",
                content,
                b"\r\n",
                f"--{boundary}--\r\n".encode(),
            ]
        )
        headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
    elif data is not None:
        body = json.dumps(data).encode()
        headers["Content-Type"] = "application/json"
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
    else:
        req = urllib.request.Request(url, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            raw = resp.read().decode() or "null"
            try:
                payload: dict | str = json.loads(raw)
            except json.JSONDecodeError:
                payload = raw
            return resp.status, payload
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode()


def pick_image(course_index: int, img_dir: Path, all_images: list[Path]) -> Path:
    if course_index < 4:
        preferred = img_dir / f"{course_index + 1}.png"
        if preferred.exists():
            return preferred
    cycle_index = max(course_index - 4, 0) % len(all_images)
    return all_images[cycle_index]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--api", default=DEFAULT_API)
    parser.add_argument("--img-dir", type=Path, default=DEFAULT_IMG_DIR)
    parser.add_argument("--token", default=os.environ.get("SIGMA_ADMIN_TOKEN", ""))
    parser.add_argument("--publish", action="store_true", help="Set course_status=Published")
    args = parser.parse_args()

    if not args.token:
        print("Set SIGMA_ADMIN_TOKEN or pass --token", file=sys.stderr)
        return 1
    if not args.img_dir.is_dir():
        print(f"Image folder not found: {args.img_dir}", file=sys.stderr)
        return 1

    all_images = sorted(
        args.img_dir.glob("*.png"),
        key=lambda path: int(path.stem) if path.stem.isdigit() else 10_000,
    )
    if not all_images:
        print("No PNG files in image folder", file=sys.stderr)
        return 1

    status, payload = api_request("GET", f"{args.api}/courses/admin/all?limit=100", args.token)
    if status != 200 or not isinstance(payload, list):
        print(f"Failed to list courses: HTTP {status} {payload}", file=sys.stderr)
        return 1

    courses = sorted(payload, key=lambda item: item["id"])
    failed = 0
    for index, course in enumerate(courses):
        course_id = course["id"]
        image = pick_image(index, args.img_dir, all_images)
        upload_status, upload_payload = api_request(
            "POST",
            f"{args.api}/courses/{course_id}/cover",
            args.token,
            file_path=image,
        )
        publish_status = None
        if args.publish:
            publish_status, _ = api_request(
                "PATCH",
                f"{args.api}/courses/{course_id}",
                args.token,
                data={"course_status": "Published"},
            )

        cover_url = upload_payload.get("cover_image_url") if isinstance(upload_payload, dict) else None
        ok = upload_status in (200, 201)
        if not ok:
            failed += 1
        print(
            f"course {course_id}: cover={upload_status} img={image.name} "
            f"publish={publish_status} url={'yes' if cover_url else 'no'}"
        )

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
