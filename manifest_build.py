import json
import sys

manifest_path = "manifest.json"

if len(sys.argv) < 2 or sys.argv[1] not in ("firefox", "chrome", "reset"):
    print("Usage: python update_manifest.py [firefox|chrome]")
    sys.exit(1)

with open(manifest_path, "r") as f:
    manifest = json.load(f)

if sys.argv[1] == "reset":
    print("Resetting manifest.json to default state.")
    manifest["background"] = {
        "scripts": ["background_script.js"],
    }
    manifest["version"] = "VERSION"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    sys.exit(0)

browser = sys.argv[1]

with open("version.txt", "r") as f:
    version = f.read().strip()

print(f"Setting up manifest for {browser} with version {version}")

# Update version
manifest["version"] = version

if browser == "chrome":
    # Convert scripts to service_worker
    if "background" in manifest and "scripts" in manifest["background"]:
        manifest["background"].pop("scripts")
        manifest["background"]["service_worker"] = "background_script.js"
        print("Updated manifest.json to use service_worker.")
    else:
        print("No background scripts found in manifest.json.")
elif browser == "firefox":
    # Convert service_worker to scripts
    if "background" in manifest and "service_worker" in manifest["background"]:
        manifest["background"].pop("service_worker")
        manifest["background"]["scripts"] = ["background_script.js"]
        print("Updated manifest.json to use scripts.")
    else:
        print("No service_worker found in manifest.json.")

with open(manifest_path, "w") as f:
    json.dump(manifest, f, indent=2)