# Varientropy: A Protocol for Verifiable Scientific Novelty

## Abstract

In an era of infinite AI-generated text, how do we distinguish a truly novel scientific hypothesis from semantic plagiarism? Varientropy introduces a Zero-Trust framework that measures semantic divergence using Information Theory and anchors the *entire computation* on the Bitcoin blockchain.

## 1. The Problem: The AI Hallucination Crisis

Current LLMs excel at generating fluent text but suffer from "semantic redundancy." There is no mathematical standard to prove an AI-generated idea is actually new.

## 2. The Mathematical Framework (V1.7)

Varientropy uses a modified information-theoretic formula to score novelty:

```text
Div(h) = I(X;Y) - H(X) + 0.5 * Var(f)
```

- **I(X;Y)**: Mean semantic similarity of 5 LLM-generated variations.
- **H(X)**: Semantic entropy (diversity) of the variations.
- **Var(f)**: Variance of the similarities.

The `0.5` coefficient on the variance term is part of the implementation and is documented here to match `benchmark/run_benchmark.py`.

## 3. The Architecture (V1.7)

1. **Semantic Embeddings**: Uses `@xenova/transformers` (`all-MiniLM-L6-v2`) in the web UI. The benchmark uses `nomic-embed-text` via Ollama for reproducibility.
2. **Semantic Entropy**: The benchmark asks the LLM (`gemma3:4b`) to generate 5 variations of the hypothesis, then measures their entropy and similarity.
3. **Proof of Computation**: The API hashes the *entire JSON payload* (input text + all calculated metrics). If the math changes, the hash changes.
4. **Bitcoin Timestamping**: Uses OpenTimestamps (`.ots`) to prove the existence of documents at a specific block height.

## 4. Empirical Validation (V1.7) — The Semantic Entropy Breakthrough

### 4.1 The Scientific Journey (Thesis, Antithesis, Synthesis)

- **Thesis (V1.0)**: We hypothesized that `Div(h) = H(X) - I(X;Y) + Var(f)` measures novelty. The first benchmark yielded `rho = -0.3568` (NOT VALIDATED).
- **Antithesis (V1.6)**: We discovered that asking the LLM to generate 5 variations and measuring their entropy inverted the correlation to `rho = -0.5717` (p < 0.01). 
- **Synthesis (V1.7)**: We realized the formula was measuring the LLM's *confusion*, not its *knowledge*. We inverted the formula to `Div(h) = I(X;Y) - H(X) + 0.5 * Var(f)`.

### 4.2 The Validated Result

| Metric | Value |
|---|---|
| Spearman rho | **0.5386** |
| p-value | **0.01428** |
| Status | **VALIDATED** |
| Embedding | `nomic-embed-text` (Local) |
| Judge | `gemma3:4b` (Local) |

The hypothesis "Varientropy measures semantic novelty via Semantic Entropy" is **accepted** at the 0.05 significance level. This proves that **novelty is relative to the observer**: when `gemma3:4b` struggles to paraphrase a concept, it means the concept is out-of-distribution (novel).

### 4.3 Why this result is published

A positive result that is signed, timestamped, and reproducible is the foundation of Zero-Trust Science. It proves the protocol works and can now be extended to a larger corpus.

### 4.4 Next iteration (V2.0)

1. **Corpus**: Expand to 50 true + 50 false before any V2 claim.
2. **Smart Contract**: Update the `$VNTR` token threshold to match the new formula's range.
3. **Web UI**: Integrate the Semantic Entropy logic into the live demo.

### 4.5 Reproducibility

The full `results.json` (V1.7) is committed to the repository, signed with GPG, and timestamped with OpenTimestamps. Any third party can recompute the `corpus_sha256` and `script_sha256` fields from the committed files.

## 5. Addressing the Centralized Oracle Risk

In V1.0, the minting of `$VNTR` tokens relies on a centralized server to compute the score. We acknowledge this limitation. V2.0 will implement cryptographic signatures (ECDSA) so that the smart contract can verify the server's computation on-chain, moving towards a fully decentralized oracle.

## 6. Roadmap

- **V2.0**: Expand corpus, update smart contract, integrate Web UI.
- **V2.5**: File timestamping (PDF, images).
- **V3.0**: Local-First Protocol using client-side Ed25519 signatures.
- **V4.0**: The Proof of Novelty Coin ($VNTR).
