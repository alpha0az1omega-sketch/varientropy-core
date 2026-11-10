# Varientropy: A Protocol for Verifiable Scientific Novelty

## Abstract
In an era of infinite AI-generated text, how do we distinguish a truly novel scientific hypothesis from semantic plagiarism? Varientropy introduces a Zero-Trust framework that measures semantic divergence using Information Theory and anchors the *entire computation* on the Bitcoin blockchain.

## 1. The Problem: The AI Hallucination Crisis
Current LLMs excel at generating fluent text but suffer from "semantic redundancy." There is no mathematical standard to prove an AI-generated idea is actually new.

## 2. The Mathematical Framework
Varientropy uses a modified information-theoretic formula to score novelty:
\[
 \text{Div}(h) = H(X) - I(X;Y) + \text{Var}(f) 
\]
- **\(H(X)\)**: Shannon Entropy (internal diversity).
- **\(I(X;Y)\)**: Mutual Information (penalizes plagiarism).
- **\(\text{Var}(f)\)**: Variance (rewards specificity).

## 3. The Architecture (V1.0)
1. **Semantic Embeddings**: Uses `@xenova/transformers` (`all-MiniLM-L6-v2`) to convert text into 384-dimensional vectors.
2. **KL Divergence**: Calculates the true Kullback-Leibler divergence against a reference corpus.
3. **Proof of Computation (Not just Input)**: Unlike basic attestations, Varientropy hashes the *entire JSON payload* (input text + all calculated metrics). If the math changes, the hash changes. This ensures the certificate proves the computation was executed correctly.
4. **Bitcoin Timestamping**: Uses OpenTimestamps (`.ots`) to prove the existence of documents at a specific block height.

## 4. Addressing the Centralized Oracle Risk
In V1.0, the minting of `$VNTR` tokens relies on a centralized server to compute the score. We acknowledge this limitation. V2.0 will implement cryptographic signatures (ECDSA) so that the smart contract can verify the server's computation on-chain, moving towards a fully decentralized oracle.

## 5. Roadmap
- **V1.5**: File timestamping (PDF, images).
- **V2.0**: Local-First Protocol using client-side Ed25519 signatures.
- **V3.0**: Real World Assets (RWA) and Digital Twins.
- **V4.0**: The Proof of Novelty Coin ($VNTR).
