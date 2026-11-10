# Varientropy-Core

Live Demo: https://varientropy-core.vercel.app

Varientropy is an open, fallible scientific framework designed to measure the semantic divergence of AI-generated hypotheses. It operates on the principle of "Zero-Trust Science": no claim is taken for granted, and every result is cryptographically verifiable.

## Status (2026-11-10)

**First blind benchmark: NOT VALIDATED.**

- Spearman rho = **-0.3568**, p = **0.1225** (n = 20).
- The score does not separate true from false novelty.
- The judge (`llama3.2:3b`) is biased on technical hypotheses.
- Full result: [`benchmark/results.json`](benchmark/results.json), signed GPG and OTS-stamped.
- Analysis: [`benchmark/README.md`](benchmark/README.md), [`WHITEPAPER.md`](WHITEPAPER.md) section 4.

This is a **negative result**, published as-is because a reproducible failure is more informative than an unverified positive claim.

## Mathematical Framework

```text
Div(h) = H(X) - I(X;Y) + 0.5 * Var(f)
```

- **H(X)**: normalized Shannon entropy of the hypothesis (internal diversity).
- **I(X;Y)**: mutual information between the hypothesis and a known corpus.
- **Var(f)**: variance of semantic similarity across the corpus.
- **0.5 coefficient**: part of the implementation, documented to match `benchmark/run_benchmark.py`.

## Current Architecture (V1.0)

- **Web UI**: `@xenova/transformers` (`all-MiniLM-L6-v2`) in a serverless Next.js environment.
- **Benchmark**: `nomic-embed-text` via Ollama, 100% local, no API keys.
- **Cryptographic Attestation**: SHA-256 hash of the entire JSON payload (input + metrics).
- **Bitcoin Timestamping**: OpenTimestamps (`.ots`) on key documents.

## Verification & Trust

We do not ask you to trust us; we ask you to verify.

- **Code Transparency**: The core mathematical logic is open-source.
- **Bitcoin Timestamping**: Key documents are anchored using OpenTimestamps.
- **Reproducibility**: The benchmark runs locally in ~30 seconds.

## Known Limitations (V1.0)

- **Corpus size**: 5 known + 20 test items. Too small for strong conclusions.
- **Model constraints**: `all-MiniLM-L6-v2` (UI) and `nomic-embed-text` (benchmark) are lightweight.
- **Proxy metric**: Max cosine similarity is a proxy, not a true KL divergence.
- **Judge bias**: `llama3.2:3b` over-rates obvious restatements.
- **First result lacks provenance hashes**: `corpus_sha256` and `script_sha256` added in script v1.1.

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
ollama pull llama3.2:3b
pip install requests scipy numpy
python benchmark/run_benchmark.py
```

## License

This project is licensed under the **Functional Source License, Version 1.1, Apache 2.0 Future License (FSL-1.1-Apache-2.0)**. 
See the `LICENSE.md` file for details.
