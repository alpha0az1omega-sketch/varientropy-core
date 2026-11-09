# External Audit & Technical Feedback (V1.0)

## 1. Mathematical Validation
- The formula Div(h) = H(X) - I(X;Y) + Var(f) is mathematically sound.
- The `-I(X;Y)` term effectively penalizes semantic plagiarism.
- The `Var(f)` term rewards specificity and contrast.

## 2. Architecture & Scaling (V2.0 Roadmap)
- **Model Upgrade**: Replace `all-MiniLM-L6-v2` (384 dims) with heavier models (OpenAI, Cohere, or `BAAI/bge-large-en-v1.5`).
- **Vector Database**: Replace the static `KNOWN_CORPUS` array with a Vector DB (Pinecone, pgvector) to query millions of real papers.

## 3. Cryptographic Proof (Zero-Trust)
- OpenTimestamps (OTS) links the SHA-256 hash to the Bitcoin blockchain.
- This proves existence at a specific block height.

## 4. Next Steps
- Fix Vercel Domains (Add `varientropy.ai` and `.com`).
- Implement the "File Timestamping" tab in the UI.
