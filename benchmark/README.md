# Varientropy Benchmark (V1.0)

## What this is

A blind benchmark that tests whether the Varientropy divergence score  
`Div(h) = H(X) - I(X;Y) + 0.5 * Var(f)` correlates with human-perceived  
scientific novelty. It uses only local, open-source models. No API keys,  
no external services, no cost per token.

## How to reproduce

1. Install Ollama: `brew install ollama`
2. Pull models:
   - `ollama pull nomic-embed-text`
   - `ollama pull llama3.2:3b`
3. Install Python dependencies:
   - `pip install requests scipy numpy`
4. Run:
   - `python benchmark/run_benchmark.py`

Expected runtime: 30–60 seconds on an Intel Mac.  
Expected output: `benchmark/results.json` and a terminal summary.

## First result (2026-11-10)

| Metric | Value |
|---|---|
| Spearman ρ | **−0.3568** |
| p-value | **0.1225** |
| Status | **NOT VALIDATED** |

The score is **anti-correlated** with novelty. The hypothesis  
"`Div(h)` measures semantic novelty" is **rejected** at the 0.05 level.

### What failed

1. **The score does not separate categories.** True-novelty scores lie in  
   [0.456, 0.565]; false-novelty scores lie in [0.242, 0.611]. The true  
   range is fully contained in the false range. Two false items score  
   highest (0.611, 0.575).

2. **The judge is biased.** `llama3.2:3b` assigns 8/10 to obvious  
   restatements (Central Limit Theorem paraphrase, No Free Lunch  
   restatement) and 6/10 to genuine results (O(n) private set intersection).

### What this means

The formula as implemented (max cosine similarity to a 5-item corpus,  
normalized entropy, scaled variance) does **not** measure semantic  
novelty. This is a negative result, signed and timestamped. It is  
published as-is because a negative empirical result is more informative  
than an unverified positive claim[reference:5].

## Next iteration (V1.1)

- Replace `llama3.2:3b` with `gemma3:4b` (already installed) or add a  
  few-shot prompt with labeled examples.
- Replace `I = max cosine similarity` with a true KL divergence against  
  `data/known_corpus.xml` (200 KB, currently unused).
- Expand the corpus to 50 true + 50 false items before any V2 claim.

## File manifest

| File | Role |
|---|---|
| `run_benchmark.py` | The benchmark script |
| `results.json` | The signed, timestamped result |
| `results.json.asc` | GPG signature |
| `results.json.asc.ots` | OpenTimestamps proof |
| `RESULT_SCHEMA.md` | Schema that `results.json` must satisfy |
