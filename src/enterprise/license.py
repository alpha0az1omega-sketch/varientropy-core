"""Enterprise license verification (Ed25519, offline-first)."""
import json, base64
from pathlib import Path
from cryptography.hazmat.primitives import serialization

PUBLIC_KEY_PATH = Path("keys/public_key.pem")

def _load_pub():
    return serialization.load_pem_public_key(PUBLIC_KEY_PATH.read_bytes())

def verify_license(license_path: Path):
    """Return payload if signature valid, None otherwise (missing/invalid)."""
    if not license_path.exists():
        return None
    try:
        raw = json.loads(license_path.read_text())
        sig = base64.b64decode(raw["signature"])
        payload = {k: v for k, v in raw.items() if k != "signature"}
        msg = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        _load_pub().verify(sig, msg)
        return payload
    except Exception:
        return None

def has_feature(payload, feature):
    return bool(payload and payload.get("features", {}).get(feature, False))
