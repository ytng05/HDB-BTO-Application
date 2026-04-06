#!/usr/bin/env python3
"""Reset and seed OutSystems ProjectsAPI with the original 4 open projects.

Runs as a one-shot container task from docker-compose.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any

BASE_URL = os.environ.get(
    "OUTSYSTEMS_PROJECT_API_URL",
    "https://personal-iu6aefgj.outsystemscloud.com/ProjectsMicroservice/rest/ProjectsAPI",
).rstrip("/")
TIMEOUT_SECONDS = float(os.environ.get("OUTSYSTEMS_SEED_TIMEOUT_SECONDS", "20"))
STRICT_MODE = os.environ.get("OUTSYSTEMS_SEED_STRICT", "false").lower() == "true"

# Original 4 open projects from project/projects.sql
SEED_PROJECTS = [
    {
        "project_id": 1,
        "exercise_id": 6,
        "project_name": "Tengah Garden Walk",
        "town_name": "Tengah",
        "flat_types": "2-Room Flexi to 5-Room",
        "status": "open",
    },
    {
        "project_id": 21,
        "exercise_id": 6,
        "project_name": "Punggol SeaVista",
        "town_name": "Punggol",
        "flat_types": "3-Room to 5-Room",
        "status": "open",
    },
    {
        "project_id": 51,
        "exercise_id": 6,
        "project_name": "Queenstown SkyGrove",
        "town_name": "Queenstown",
        "flat_types": "2-Room Flexi to 5-Room",
        "status": "open",
    },
    {
        "project_id": 52,
        "exercise_id": 6,
        "project_name": "Kallang RiverFront",
        "town_name": "Kallang/Whampoa",
        "flat_types": "3-Room to 5-Room",
        "status": "open",
    },
]


def http_json(method: str, url: str, payload: dict[str, Any] | None = None) -> tuple[int, dict[str, Any], str]:
    body = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(url=url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            raw = response.read().decode("utf-8", errors="replace")
            try:
                parsed = json.loads(raw) if raw else {}
            except json.JSONDecodeError:
                parsed = {}
            return response.status, parsed if isinstance(parsed, dict) else {}, raw
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            parsed = {}
        return error.code, parsed if isinstance(parsed, dict) else {}, raw


def ensure_ok(status: int, operation: str, raw: str) -> None:
    if 200 <= status < 300:
        return
    raise RuntimeError(f"{operation} failed with status {status}. Body: {raw[:400]}")


def main() -> int:
    projects_url = f"{BASE_URL}/projects"
    print(f"[seeder] Using OutSystems API: {projects_url}")

    status, payload, raw = http_json("GET", projects_url)
    ensure_ok(status, "GET /projects", raw)

    existing = payload.get("data")
    if not isinstance(existing, list):
        raise RuntimeError("GET /projects returned invalid payload shape (expected data list).")

    print(f"[seeder] Existing projects to remove: {len(existing)}")
    deleted = 0
    for row in existing:
        if not isinstance(row, dict):
            continue
        project_id = row.get("project_id")
        if not isinstance(project_id, int):
            continue

        delete_url = f"{projects_url}/{project_id}"
        d_status, _, d_raw = http_json("DELETE", delete_url)
        if 200 <= d_status < 300 or d_status == 404:
            deleted += 1
            continue
        raise RuntimeError(f"DELETE /projects/{project_id} failed with status {d_status}. Body: {d_raw[:400]}")

    print(f"[seeder] Removed projects: {deleted}")

    created = 0
    for project in SEED_PROJECTS:
        c_status, _, c_raw = http_json("POST", projects_url, payload=project)
        if not (200 <= c_status < 300):
            # Fallback: retry without explicit project_id when API auto-generates IDs.
            retry_payload = dict(project)
            retry_payload.pop("project_id", None)
            c_status, _, c_raw = http_json("POST", projects_url, payload=retry_payload)

        ensure_ok(c_status, f"POST /projects ({project['project_name']})", c_raw)
        created += 1

    print(f"[seeder] Inserted projects: {created}")
    print("[seeder] OutSystems project reset complete.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"[seeder] ERROR: {exc}", file=sys.stderr)
        if STRICT_MODE:
            raise SystemExit(1)
        print("[seeder] Continuing because OUTSYSTEMS_SEED_STRICT=false", file=sys.stderr)
        raise SystemExit(0)
