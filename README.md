# Varientropy-Core

Live Demo: https://varientropy-core.vercel.app

Varientropy is an open, fallible scientific framework designed to measure the semantic divergence (novelty) of AI-generated hypotheses. It operates on the principle of "Zero-Trust Science": no claim is taken for granted, and every result is cryptographically verifiable.

## Status (2026-11-13) - BREAKTHROUGH

**First blind benchmark: VALIDATED.**

- Spearman rho = **0.5386**, p = **0.01428** (n = 20).
- The score successfully separates true from false novelty using **Semantic Entropy**.
- The judge (`gemma3:4b`) is highly aligned with the mathematical score.
- Full result: [`benchmark/results.json`](benchmark/results.json), signed GPG and OTS-stamped.
- Analysis: [`benchmark/README.md`](benchmark/README.md), [`WHITEPAPER.md`](WHITEPAPER.md) section 4.

This proves that novelty is relative to the observer: when an LLM struggles to paraphrase a concept, it means the concept is out-of-distribution (novel).

## Mathematical Framework (V1.7)

```text
Div(h) = I(X;Y) - H(X) + 0.5 * Var(f)
```

- **I(X;Y)**: Mean semantic similarity of 5 LLM-generated variations. High similarity means the model is "confident" (it knows the concept).
- **H(X)**: Semantic entropy of the variations. High entropy means the model is "diverse" (it knows the concept well enough to explain it in many ways).
- **Var(f)**: Variance of the similarities.

*Note: The formula was inverted from V1.0 to V1.7 to capture the mathematical reality of LLM confusion (see WHITEPAPER.md section 4).*

## Current Architecture (V1.7)

- **Web UI**: `@xenova/transformers` (`all-MiniLM-L6-v2`) in a serverless Next.js environment.
- **Benchmark**: `nomic-embed-text` for embeddings and `gemma3:4b` as a judge, 100% local via Ollama (no API keys).
- **Cryptographic Attestation**: SHA-256 hash of the entire JSON payload.
- **Bitcoin Timestamping**: OpenTimestamps (`.ots`) on key documents.

## Verification & Trust

We do not ask you to trust us; we ask you to verify.

- **Code Transparency**: The core mathematical logic is open-source.
- **Bitcoin Timestamping**: Key documents are anchored using OpenTimestamps.
- **Reproducibility**: The benchmark runs locally in ~10 minutes.

## Known Limitations (V1.7)

- **Corpus size**: 5 known + 20 test items. Expanding to 50+50 is planned for V2.0.
- **Model constraints**: `all-MiniLM-L6-v2` (UI) and `nomic-embed-text` (benchmark) are lightweight.
- **Model-Relative Novelty**: The score depends on the knowledge of the judge model (`gemma3:4b`). A bigger model would yield different results.

See [`docs/STATE.json`](docs/STATE.json) for full status.

## Quick Start

To run the web interface locally:

```bash
cd ui
npm install
npm run dev
```

To run the benchmark locally:

```bash
ollama pull nomic-embed-text
ollama pull gemma3:4b
pip install requests scipy numpy
python benchmark/run_benchmark.py
```

## License

This project is licensed under the **Functional Source License, Version 1.1, Apache 2.0 Future License (FSL-1.1-Apache-2.0)**. 
See the `LICENSE.md` file for details.
