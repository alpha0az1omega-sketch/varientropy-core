# External Audit & Technical Feedback (V1.0)

## 1. Cryptographic Weakness (Fixed)
- **Critique**: The SHA-256 hash only covered the query (`SHA-256("abc")`), not the metrics. It was a "Proof of Input", not a "Proof of Computation".
- **Fix**: The API now hashes the *entire JSON payload* (query + metrics + AI analysis). Any change in the math changes the hash.

## 2. Arithmetic Inconsistency (Explained)
- **Critique**: The displayed `H - I + Var` did not exactly match the final score.
- **Explanation**: The code uses raw floats for the calculation and rounds to 4 decimals at the very end. The whitepaper now clarifies this.

## 3. Tokenomics Risks (Fixed)
- **Critique**: The symbol `$NOVL` conflicts with an existing Solana token. The mechanism is a centralized oracle.
- **Fix**: The symbol is changed to `$VNTR`. The V2.0 roadmap includes ECDSA signatures to decentralize the oracle.

## 4. Code Transparency
- The source code for the API (`ui/app/api/vdg/route.ts`) and the smart contract (`contracts/VarientropyToken.sol`) is fully open-source.
