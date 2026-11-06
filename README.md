# Varientropy-Core

**Live Demo:** [https://varientropy-core.vercel.app](https://varientropy-core.vercel.app)

**Varientropy** is an open, fallible scientific framework designed to measure the semantic divergence of AI-generated hypotheses. It operates on the principle of "Zero-Trust Science": no claim is taken for granted, and every result is cryptographically verifiable.

## 🧮 The Mathematical Framework

The core of the engine relies on a modified information-theoretic formula:

`Div(h) = H(X) - I(X;Y) + Var(f)`

Where:
- **H(X)** is the normalized Shannon entropy of the hypothesis (measuring its internal diversity).
- **I(X;Y)** is the mutual information between the hypothesis and a known corpus (measuring how much of it is "already known").
- **Var(f)** is the variance of semantic similarity across the corpus (measuring the contrast or specificity of the hypothesis).

## 🏗️ Current Architecture (V1.0)

This repository contains a working prototype of the Varientropy Divergence Gate (VDG).

1. **Semantic Embeddings**: The system uses `@xenova/transformers` (running `all-MiniLM-L6-v2`) directly in a serverless Next.js environment. It converts text into 384-dimensional vectors based on actual meaning, not just keyword frequency.
2. **Information Theory Pipeline**: Vectors are converted into probability distributions using the Softmax function. The system then calculates the true Kullback-Leibler (KL) divergence against a reference corpus.
3. **Cryptographic Attestation**: For any given input, the API generates a JSON certificate containing the metrics and a deterministic SHA-256 hash. 
4. **Deterministic Verification**: The SHA-256 hash depends *only* on the user's query. If the same query is submitted twice, the hash and the mathematical metrics will be identical. The UTC timestamp proves *when* the attestation was generated.

## 🛡️ Verification & Trust

We do not ask you to trust us; we ask you to verify.
- **Code Transparency**: The core mathematical logic is fully open-source.
- **Bitcoin Timestamping**: Key architectural documents are anchored to the Bitcoin blockchain using OpenTimestamps (`.ots` files).
- **Security**: The enterprise license logic (Ed25519) is isolated from the core scientific logic to ensure auditable transparency.

## ⚠️ Known Limitations (V1.0)

A "fallible" system must openly state its limits:
- **Corpus Size**: The current reference corpus (`KNOWN_CORPUS`) is a small static array. Future versions will connect to a vector database (e.g., Pinecone, pgvector) containing millions of real scientific abstracts.
- **Model Constraints**: `all-MiniLM-L6-v2` is a lightweight model designed for speed. It may miss deep academic nuances.
- **Proxy Metrics**: While KL divergence is mathematically rigorous, using it as a direct proxy for "scientific novelty" is a hypothesis that requires further empirical validation.

## 🚀 Quick Start

To run the interface locally:
```bash
cd ui
npm install
npm run dev

