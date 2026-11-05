#!/usr/bin/env python3
"""Varientropy Divergence Gate (VDG) — stub pipeline."""
import json, hashlib
from pathlib import Path
from datetime import datetime, timezone
import numpy as np

def generate_hypotheses(n=20, seed=42):
    rng = np.random.default_rng(seed)
    return [f"Hypothesis_{i}: mechanism_{rng.integers(0, 10_000)}" for i in range(n)]

def embed(texts, dim=64):
    out = np.zeros((len(texts), dim))
    for i, t in enumerate(texts):
        h = hashlib.sha512(t.encode()).digest()   # 64 bytes
        out[i] = np.frombuffer(h, dtype=np.uint8)[:dim].astype(float) / 255.0
    return out

def mi_proxy(hyp_emb, known_emb):
    """Per-hypothesis proxy for I(h; D_known): max cosine similarity."""
    def norm(x):
        return x / (np.linalg.norm(x, axis=1, keepdims=True) + 1e-12)
    H = norm(hyp_emb)
    K = norm(known_emb)
    sims = H @ K.T                    # (n_hyp, n_known)
    return sims.max(axis=1)           # (n_hyp,)

def main():
    known = ["Existing result A about entropy",
             "Existing result B about mutual information",
             "Existing result C about variance"]
    hyps = generate_hypotheses(n=20)
    he, ke = embed(hyps), embed(known)
    mi = mi_proxy(he, ke)                                       # (20,)
    ent = -np.sum(np.abs(he) * np.log2(np.abs(he) + 1e-12), axis=1)  # (20,)
    div = ent - mi                                              # (20,)
    order = np.argsort(div)[::-1][:5]
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = Path("experiments") / f"vdg_result_{ts}.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps({
        "timestamp": ts,
        "formula": "H(X)-I(X;Y)+Var(f)",
        "proxy": "max_cosine_similarity",
        "selected": [{"hypothesis": hyps[i], "div_mean": float(div[i])} for i in order]
    }, indent=2))
    print(f"[VDG] wrote {out}")

if __name__ == "__main__":
    main()
