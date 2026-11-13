"""
Varientropy Benchmark — V1.7 (The Inversion)
Formula: div = I - H + 0.5*Var
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
JUDGE_MODEL = "gemma3:4b"

CORPUS_PATH = Path("data/benchmark_corpus.json")
SCRIPT_PATH = Path("benchmark/run_benchmark.py")
RESULTS_PATH = Path("benchmark/results.json")

def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def embed(texts):
    all_embs = []
    for i in range(0, len(texts), 10):
        batch = texts[i:i+10]
        r = requests.post(
            f"{OLLAMA}/v1/embeddings",
            json={"model": EMBED_MODEL, "input": batch},
            timeout=120,
        )
        r.raise_for_status()
        all_embs.extend([d["embedding"] for d in r.json()["data"]])
    return np.array(all_embs)

def generate_variations(text):
    prompt = f"""Rewrite the following scientific hypothesis in exactly 5 different ways. 
Keep the core meaning, but change the wording and perspective.
Output ONLY the 5 sentences, separated by newlines. No numbering, no intro.

Hypothesis: {text}"""
    
    r = requests.post(
        f"{OLLAMA}/v1/chat/completions",
        json={
            "model": JUDGE_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
        },
        timeout=300,
    )
    r.raise_for_status()
    content = r.json()["choices"][0]["message"]["content"].strip()
    lines = [line.strip() for line in content.split("\n") if len(line.strip()) > 15]
    if len(lines) < 5:
        lines.append(text)
    return lines[:5]

def judge(text):
    system_prompt = """You are a ruthless scientific reviewer. Rate NOVELTY 1-10.
1-3: Known fact or paraphrase. 4-6: Incremental. 7-8: Genuinely new. 9-10: Groundbreaking.
Examples: 
"A paraphrase of the Central Limit Theorem" -> 2
"A zero-knowledge proof of matrix multiplication" -> 8
Answer ONLY with an integer."""

    r = requests.post(
        f"{OLLAMA}/v1/chat/completions",
        json={
            "model": JUDGE_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Hypothesis: \"{text}\"\nScore:"},
            ],
            "temperature": 0.0,
        },
        timeout=300,
    )
    r.raise_for_status()
    m = re.search(r"\d+", r.json()["choices"][0]["message"]["content"].strip())
    return int(m.group()) if m else 5

def entropy(p):
    p = p[p > 0]
    return -np.sum(p * np.log2(p))

def softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()

def main():
    data = json.loads(CORPUS_PATH.read_text())
    items = [("true", t) for t in data["true_novelty"]] + [
        ("false", f) for f in data["false_novelty"]
    ]

    results = []
    for label, text in items:
        variations = generate_variations(text)
        embs = embed(variations)
        
        sims_matrix = []
        for i in range(len(embs)):
            for j in range(i+1, len(embs)):
                v1, v2 = embs[i], embs[j]
                sim = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-12)
                sims_matrix.append(sim)
        
        sims_array = np.array(sims_matrix)
        p_sims = softmax(sims_array * 10)
        H = entropy(p_sims) / math.log2(len(p_sims))
        I = float(np.mean(sims_array))
        Var = float(np.var(sims_array))
        
        # LA FORMULE VALIDÉE (V1.7)
        div = I - H + 0.5 * Var
        
        j = judge(text)
        
        results.append(
            {
                "label": label,
                "text": text[:60],
                "div": div,
                "judge": j,
                "H": float(H),
                "I": I,
                "Var": Var,
            }
        )
        print(f"[{label}] div={div:.4f} judge={j} | {text[:50]}")
        time.sleep(0.2)

    divs = [r["div"] for r in results]
    judges = [r["judge"] for r in results]
    rho, pval = spearmanr(divs, judges)

    out = {
        "schema_version": "1.7",
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
