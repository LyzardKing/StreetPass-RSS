import json
import sys

manifest_path = "manifest.json"

if len(sys.argv) < 2 or sys.argv[1] not in ("reset"):
    print("Usage: python update_manifest.py set|reset")
    sys.exit(1)

with open(manifest_path, "r") as f:
    manifest = json.load(f)

if sys.argv[1] == "reset":
    print("Resetting manifest.json to default state.")
    manifest["version"] = "VERSION"
else:
    with open("version.txt", "r") as f:
        version = f.read().strip()
    # Update version
    manifest["version"] = version

with open(manifest_path, "w") as f:
    json.dump(manifest, f, indent=2)