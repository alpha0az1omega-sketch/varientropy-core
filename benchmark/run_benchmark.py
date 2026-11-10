"""
Varientropy Benchmark 48h
Computes Div(h) = H(X) - I(X;Y) + 0.5*Var(f) using semantic embeddings,
then correlates with a blind LLM judge (GPT-4o-mini) via Spearman rho.
"""
import json, os, math, sys
from pathlib import Path
from datetime import datetime, timezone
import numpy as np
from scipy.stats import spearmanr

# ---------- 1. Load corpus ----------
CORPUS = Path("data/benchmark_corpus.json")
data = json.loads(CORPUS.read_text())
known = data["known_corpus"]
true_nov = data["true_novelty"]
false_nov = data["false_novelty"]

items = [("true", t) for t in true_nov] + [("false", f) for f in false_nov]

# ---------- 2. Semantic embedding ----------
# Same model as the JS UI: all-MiniLM-L6-v2
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")

def embed(texts):
    return model.encode(texts, normalize_embeddings=True)

known_emb = embed(known)

# ---------- 3. Divergence score ----------
def softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()

def entropy(p):
    p = p[p > 0]
    return -np.sum(p * np.log2(p))

def div_score(text):
    v = embed([text])[0]
    p = softmax(v)
    H = entropy(p) / math.log2(len(p))       # normalized Shannon
    sims = known_emb @ v                     # cosine (both normalized)
    I = float(np.max(sims))                  # max similarity as proxy
    Var = float(np.var(sims) * 4)            # scaled variance
    return {"H": H, "I": I, "Var": Var, "div": H - I + 0.5 * Var}

# ---------- 4. LLM judge (blind) ----------
def judge(text):
    import requests
    key = os.environ["OPENAI_API_KEY"]
    r = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}"},
        json={
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content":
                 "Rate the NOVELTY of this hypothesis on a scale 1-10. "
                 "Respond with a single integer, nothing else."},
                {"role": "user", "content": text}
            ],
            "temperature": 0.0
        },
        timeout=60
    )
    r.raise_for_status()
    return int(r.json()["choices"][0]["message"]["content"].strip())

# ---------- 5. Main ----------
results = []
for label, text in items:
    d = div_score(text)
    j = judge(text)
    results.append({
        "label": label,
        "text": text[:120],
        "div": d["div"],
        "judge": j,
        "H": d["H"], "I": d["I"], "Var": d["Var"]
    })
    print(f"[{label}] div={d['div']:.4f} judge={j} | {text[:60]}")

divs = [r["div"] for r in results]
judges = [r["judge"] for r in results]
rho, p = spearmanr(divs, judges)

out = {
    "timestamp_utc": datetime.now(timezone.utc).isoformat(),
    "model": "all-MiniLM-L6-v2",
    "judge": "gpt-4o-mini",
    "n_items": len(results),
    "spearman_rho": float(rho),
    "p_value": float(p),
    "validated": bool(rho > 0.5 and p < 0.05),
    "results": results
}
Path("benchmark/results.json").write_text(json.dumps(out, indent=2))
print(f"\nSpearman rho = {rho:.4f}, p = {p:.4g}")
print("VALIDATED" if out["validated"] else "NOT VALIDATED")
