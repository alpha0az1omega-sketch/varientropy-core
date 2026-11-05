"""Enterprise divergence gate: switches between simple and advanced modes
based on a valid Ed25519 license."""
from pathlib import Path
from .license import verify_license, has_feature

def final_divergence_gate(hypotheses, divergence_scores):
    payload = verify_license(Path("keys/license_demo-hwid.lic"))
    if not has_feature(payload, "enterprise_divergence"):
        return _simple_gate(hypotheses, divergence_scores)
    return _advanced_gate(hypotheses, divergence_scores)

def _simple_gate(h, s):
    return [(x, y) for x, y in zip(h, s) if y > 0.5]

def _advanced_gate(h, s):
    return sorted(zip(h, s), key=lambda t: -t[1])[:5]
