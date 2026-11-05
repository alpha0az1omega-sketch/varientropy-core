## 🏗️ Repository Architecture & Verifiability

We believe in "Zero-Trust Science". To ensure full auditability, our code is strictly separated:

1. **The Core Science (100% Open Source)**: 
   - `src/vdg.py` (The Divergence Gate Algorithm)
   - `src/quantum_entropy.py` (The Qubit Alignment)
   - `benchmark.py` (The AI-Judge Validation Protocol)
   *Status: Fully auditable. No proprietary logic.*

2. **The Enterprise Layer (Private)**: 
   - `src/enterprise/` contains the Ed25519 cryptographic license gate. This is **not** part of the science; it is purely the business logic to prevent unauthorized commercial use. The core math does not depend on it.
