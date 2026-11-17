#!/usr/bin/env python3
"""Package the public site without uploading local settings or old drafts."""

from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "dist"

if OUTPUT.exists():
    shutil.rmtree(OUTPUT)
OUTPUT.mkdir()

for page in sorted(ROOT.glob("*.html")):
    shutil.copy2(page, OUTPUT / page.name)
for name in ("styles.css", "site.js"):
    shutil.copy2(ROOT / name, OUTPUT / name)
shutil.copytree(ROOT / "images", OUTPUT / "images")
(OUTPUT / ".nojekyll").touch()

print(f"Packaged {sum(p.is_file() for p in OUTPUT.rglob('*'))} public files in dist/.")
