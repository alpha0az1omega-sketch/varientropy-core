# Varientropy Tokenomics: The Proof of Novelty Coin ($VNTR)

## 1. Concept
The Varientropy Token ($VNTR) is not a speculative memecoin. It is an **Intellectual Asset Token**. It represents the mathematical rarity of a novel hypothesis. (Note: The symbol was changed from $NOVL to $VNTR to avoid conflict with an existing Solana token).

## 2. The Mechanism: Proof of Novelty (PoN)
Users earn $VNTR by submitting hypotheses to the Varientropy Divergence Gate.

- **The Rule**: If the API returns a `divergence_score` > 0.80, they mint 1 $VNTR.
- **The Rarity**: If the score is < 0.50, the hypothesis is rejected (plagiarism).

## 3. Addressing the Audit (Centralized Oracle Risk)
The audit correctly noted that V1.0 is a centralized oracle. To mitigate this:
- **Proof of Computation**: The server hashes the entire payload, not just the input.
- **V2.0 Decentralization**: The server will sign the result with an ECDSA private key. The smart contract will verify this signature before minting. If the server is compromised, the contract will reject invalid signatures.

## 4. Deployment Strategy
- **Network**: Layer 2 (Base Sepolia for testing, Base Mainnet for launch).
- **Smart Contract**: `contracts/VarientropyToken.sol`
