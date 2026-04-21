#!/usr/bin/env python3
"""Extract Google cookies from Firefox profile → JSON stdout.

Used by whisk-browser.ts to inject auth into Playwright.
Copies cookies.sqlite first to avoid lock conflicts with running Firefox.
"""

import json
import os
import shutil
import sqlite3
import sys
import tempfile

PROFILE = os.path.join(
    os.environ.get("APPDATA", ""),
    r"Mozilla\Firefox\Profiles\whx7rrxn.default-release",
)
COOKIES_DB = os.path.join(PROFILE, "cookies.sqlite")

if not os.path.exists(COOKIES_DB):
    print(json.dumps({"error": f"Firefox cookies.sqlite not found at {COOKIES_DB}"}))
    sys.exit(1)

# Copy DB + WAL/SHM to avoid lock issues while Firefox is running
tmp = os.path.join(tempfile.gettempdir(), "ff_cookies_extract.sqlite")
shutil.copy2(COOKIES_DB, tmp)
for ext in ("-wal", "-shm"):
    src = COOKIES_DB + ext
    if os.path.exists(src):
        shutil.copy2(src, tmp + ext)

try:
    conn = sqlite3.connect(f"file:{tmp}?mode=ro", uri=True)
    rows = conn.execute(
        "SELECT name, value, host, path, expiry, isSecure, isHttpOnly, sameSite "
        "FROM moz_cookies "
        "WHERE host LIKE '%google%' OR host LIKE '%.google.%' OR host LIKE '%youtube%'"
    ).fetchall()
    conn.close()

    sameSiteMap = {0: "None", 1: "Lax", 2: "Strict"}
    cookies = []
    for name, value, host, path_, expiry, secure, httponly, ss in rows:
        if not value:
            continue  # Skip empty cookies
        # Playwright expects -1 for session cookies, positive unix timestamp otherwise
        # Firefox uses 0 for session cookies and sometimes has stale/negative values
        if expiry is None or expiry <= 0:
            pw_expiry = -1
        elif expiry > 1e12:
            # Firefox may store expiry in milliseconds — convert to seconds
            pw_expiry = int(expiry // 1000)
        else:
            pw_expiry = int(expiry)
        cookies.append({
            "name": name,
            "value": value,
            "domain": host,
            "path": path_,
            "expires": pw_expiry,
            "secure": bool(secure),
            "httpOnly": bool(httponly),
            "sameSite": sameSiteMap.get(ss, "Lax"),
        })

    print(json.dumps(cookies))

finally:
    for f in (tmp, tmp + "-wal", tmp + "-shm"):
        try:
            os.unlink(f)
        except OSError:
            pass
