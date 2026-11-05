"""Issue a signed Ed25519 license. Run offline, keep private key safe."""
import json, base64, sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from cryptography.hazmat.primitives import serialization

def issue(hwid, features, days=30):
    priv = serialization.load_pem_private_key(
        Path("keys/private_key.pem").read_bytes(), password=None)
    payload = {
        "hwid": hwid,
        "features": features,
        "issued": datetime.now(timezone.utc).isoformat(),
        "expires": (datetime.now(timezone.utc) + timedelta(days=days)).isoformat(),
    }
    msg = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    sig = priv.sign(msg)
    out = dict(payload, signature=base64.b64encode(sig).decode())
    Path(f"keys/license_{hwid}.lic").write_text(json.dumps(out, indent=2))
    print(f"issued: keys/license_{hwid}.lic")

if __name__ == "__main__":
    issue(sys.argv[1] if len(sys.argv) > 1 else "demo-hwid",
          {"enterprise_divergence": True}, days=30)
