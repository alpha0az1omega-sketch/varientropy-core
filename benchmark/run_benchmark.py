"""
Varientropy Benchmark 48h — 100% local via Ollama
Div(h) = H - I + 0.5*Var using nomic-embed-text (semantic)
Judge: llama3.2:3b, temperature 0

Produces results.json conforming to benchmark/RESULT_SCHEMA.md.
"""
import hashlib
import json
import math
import re
import time
from pathlib import Path
from datetime import datetime, timezone

import numpy as np
import requests
from scipy.stats import spearmanr

OLLAMA = "http://localhost:11434"
EMBED_MODEL = "nomic-embed-text"
JUDGE_MODEL = "llama3.2:3b"

CORPUS_PATH = Path("data/benchmark_corpus.json")
SCRIPT_PATH = Path("benchmark/run_benchmark.py")
RESULTS_PATH = Path("benchmark/results.json")


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def embed(texts):
    r = requests.post(
        f"{OLLAMA}/v1/embeddings",
        json={"model": EMBED_MODEL, "input": texts},
        timeout=120,
    )
    r.raise_for_status()
    return np.array([d["embedding"] for d in r.json()["data"]])


def judge(text):
    r = requests.post(
        f"{OLLAMA}/v1/chat/completions",
        json={
            "model": JUDGE_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Rate the NOVELTY of this hypothesis on a scale 1-10. "
                        "Reply with a single integer, nothing else."
                    ),
                },
                {"role": "user", "content": text},
            ],
            "temperature": 0.0,
        },
        timeout=300,
    )
    r.raise_for_status()
    raw = r.json()["choices"][0]["message"]["content"].strip()
    m = re.search(r"\d+", raw)
    return int(m.group()) if m else 5


def entropy(p):
    p = p[p > 0]
    return -np.sum(p * np.log2(p))


def softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()


def main():
    data = json.loads(CORPUS_PATH.read_text())
    known = data["known_corpus"]
    items = [("true", t) for t in data["true_novelty"]] + [
        ("false", f) for f in data["false_novelty"]
    ]

    print(f"Embedding {len(known)} known items...")
    known_emb = embed(known)

    results = []
    for label, text in items:
        v = embed([text])[0]
        p = softmax(v)
        H = entropy(p) / math.log2(len(p))
        sims = known_emb @ v / (
            np.linalg.norm(known_emb, axis=1) * np.linalg.norm(v) + 1e-12
        )
        I = float(np.max(sims))
        Var = float(np.var(sims) * 4)
        div = H - I + 0.5 * Var
        j = judge(text)
        results.append(
            {
                "label": label,
                "text": text[:120],
                "div": div,
                "judge": j,
                "H": float(H),
                "I": I,
                "Var": Var,
            }
        )
        print(f"[{label}] div={div:.4f} judge={j} | {text[:60]}")
        time.sleep(0.2)

    divs = [r["div"] for r in results]
    judges = [r["judge"] for r in results]
    rho, pval = spearmanr(divs, judges)

    out = {
        "schema_version": "1.0",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "embedding_model": EMBED_MODEL,
        "judge_model": JUDGE_MODEL,
        "n_items": len(results),
        "corpus_sha256": sha256_file(CORPUS_PATH),
        "script_sha256": sha256_file(SCRIPT_PATH),
        "spearman_rho": float(rho),
        "p_value": float(pval),
        "validated": bool(rho > 0.5 and pval < 0.05),
        "results": results,
    }

    RESULTS_PATH.write_text(json.dumps(out, indent=2))
    print(f"\nSpearman rho = {rho:.4f}, p = {pval:.4g}")
    print("VALIDATED" if out["validated"] else "NOT VALIDATED")


if __name__ == "__main__":
    main()
