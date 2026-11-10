# Varientropy: A Protocol for Verifiable Scientific Novelty

## Abstract

In an era of infinite AI-generated text, how do we distinguish a truly novel scientific hypothesis from semantic plagiarism? Varientropy introduces a Zero-Trust framework that measures semantic divergence using Information Theory and anchors the *entire computation* on the Bitcoin blockchain.

## 1. The Problem: The AI Hallucination Crisis

Current LLMs excel at generating fluent text but suffer from "semantic redundancy." There is no mathematical standard to prove an AI-generated idea is actually new.

## 2. The Mathematical Framework

Varientropy uses a modified information-theoretic formula to score novelty:

```text
Div(h) = H(X) - I(X;Y) + 0.5 * Var(f)
```

- **H(X)**: Shannon Entropy (internal diversity).
- **I(X;Y)**: Mutual Information (penalizes plagiarism).
- **Var(f)**: Variance (rewards specificity).

The `0.5` coefficient on the variance term is part of the implementation and is documented here to match `benchmark/run_benchmark.py`.

## 3. The Architecture (V1.0)

1. **Semantic Embeddings**: Uses `@xenova/transformers` (`all-MiniLM-L6-v2`) in the web UI. The benchmark uses `nomic-embed-text` via Ollama for reproducibility.
2. **KL Divergence**: The benchmark uses max cosine similarity as a proxy for mutual information. A true KL divergence against a larger corpus is planned for V1.1.
3. **Proof of Computation**: The API hashes the *entire JSON payload* (input text + all calculated metrics). If the math changes, the hash changes.
4. **Bitcoin Timestamping**: Uses OpenTimestamps (`.ots`) to prove the existence of documents at a specific block height.

## 4. Empirical Validation (V1.0) — First Blind Benchmark

### 4.1 Setup

| Component | Choice | Reason |
|---|---|---|
| Embedding model | `nomic-embed-text` (768-dim) | Open-source, runs locally via Ollama |
| Judge model | `llama3.2:3b` | Open-source, runs locally, no API cost |
| Corpus | 5 known + 10 true-novelty + 10 false-novelty | Starter size, expandable |
| Runtime | ~30 seconds on Intel Mac | Fully reproducible without GPU |

### 4.2 Result

| Metric | Value |
|---|---|
| Spearman rho | **-0.3568** |
| p-value | **0.1225** |
| Status | **NOT VALIDATED** |

The divergence score is **anti-correlated** with the judge's novelty rating. The hypothesis "`Div(h)` measures semantic novelty" is **rejected** at the 0.05 significance level.

### 4.3 What failed

**Failure 1 — The score does not separate categories.**

True-novelty scores: [0.456, 0.565].
False-novelty scores: [0.242, 0.611].
The true range is entirely contained in the false range. The two highest scores (0.611, 0.575) belong to false hypotheses.

**Failure 2 — The judge is biased.**

`llama3.2:3b` assigns 8/10 to obvious restatements (Central Limit Theorem paraphrase, No Free Lunch restatement) and 6/10 to a genuine result (O(n) private set intersection protocol).

### 4.4 Why this result is published

A negative result that is signed, timestamped, and reproducible is more valuable than an unverified positive claim. It constrains future design: any V2 must explicitly address why the current score fails to separate categories, and why the judge fails to recognize genuine novelty.

### 4.5 Next iteration (V1.1)

1. **Judge**: replace `llama3.2:3b` with `gemma3:4b` or add few-shot examples.
2. **Score**: replace `I = max cosine similarity` with a true KL divergence against `data/known_corpus.xml` (200 KB, currently unused).
3. **Corpus**: expand to 50 true + 50 false before any V2 claim.

### 4.6 Reproducibility

The full `results.json` is committed to the repository, signed with GPG, and timestamped with OpenTimestamps. The first result (2026-11-10) does not contain `corpus_sha256` or `script_sha256`; these were added in script V1.1 and will be present in the next run.

## 5. Addressing the Centralized Oracle Risk

In V1.0, the minting of `$VNTR` tokens relies on a centralized server to compute the score. We acknowledge this limitation. V2.0 will implement cryptographic signatures (ECDSA) so that the smart contract can verify the server's computation on-chain, moving towards a fully decentralized oracle.

## 6. Roadmap

- **V1.1**: Repair the judge and the score (see section 4.5).
- **V1.5**: File timestamping (PDF, images).
- **V2.0**: Local-First Protocol using client-side Ed25519 signatures.
- **V3.0**: Real World Assets (RWA) and Digital Twins.
- **V4.0**: The Proof of Novelty Coin ($VNTR).
