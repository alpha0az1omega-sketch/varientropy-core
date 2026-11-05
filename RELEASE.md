# Varientropy v0.1.0

- **Date (UTC)**: 2026-11-05T01:34:53Z
- **Commit**: 054bef816bf6dfe4b1f6310bf02d3a2d5cb54e9b
- **GPG fingerprint**: 1486F115A1BE731FA18414579BA07862D3FB303D
- **Formula**: H(X) - I(X;Y) + Var(f)
- **License**: FSL-1.1-Apache-2.0

## Contents
- `src/vdg.py` — Varientropy Divergence Gate
- `src/enterprise/` — Ed25519 license gate (proprietary)
- `experiments/vdg_result_*.json` — reproducible run
- `docs/STATE.json` — corpus hash, reproducibility flag
- `LICENSE.md` — FSL, signed + OTS-stamped
- `ots/ledger.jsonl` — OTS ledger

## Verification
```
gpg --verify RELEASE.md.asc RELEASE.md
ots verify RELEASE.md.asc.ots
git tag -v v0.1.0
```
