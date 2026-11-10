# Benchmark Result Schema (v1.0)

Every benchmark run MUST produce a `results.json` file that conforms to this schema.  
This file is the **machine-readable contract** between the benchmark script, the signed proof, and any downstream analysis.

## Top-level fields

| Field | Type | Required | Description |
|---|---|---|---|
| `schema_version` | string | yes | `"1.0"` |
| `timestamp_utc` | string (ISO 8601) | yes | When the run started |
| `embedding_model` | string | yes | Model used for semantic embeddings |
| `judge_model` | string | yes | Model used as novelty judge |
| `n_items` | integer | yes | Number of hypotheses evaluated |
| `corpus_sha256` | string | yes | SHA-256 of `data/benchmark_corpus.json` at run time |
| `script_sha256` | string | yes | SHA-256 of `benchmark/run_benchmark.py` at run time |
| `spearman_rho` | float | yes | Spearman correlation between `div` and `judge` |
| `p_value` | float | yes | Two-sided p-value of `spearman_rho` |
| `validated` | boolean | yes | `true` iff `rho > 0.5` AND `p_value < 0.05` |
| `results` | array | yes | One record per hypothesis (see below) |

## Result record fields

| Field | Type | Required | Description |
|---|---|---|---|
| `label` | string | yes | `"true"` or `"false"` (ground truth, hidden from judge) |
| `text` | string | yes | Truncated hypothesis (max 120 chars) |
| `div` | float | yes | `H - I + 0.5 * Var` |
| `judge` | integer | yes | Novelty score 1–10 from the judge model |
| `H` | float | yes | Normalized Shannon entropy |
| `I` | float | yes | Maximum cosine similarity to known corpus |
| `Var` | float | yes | Scaled variance of similarities |

## Validation rules

1. `n_items` MUST equal `len(results)`.
2. `validated` MUST be `false` when `rho <= 0.5` or `p_value >= 0.05`.
3. `corpus_sha256` and `script_sha256` MUST be recomputable from the committed files.
4. The file MUST be signed with GPG and stamped with OpenTimestamps before commit.

## Why this schema exists

A result without provenance is an opinion. This schema forces every run to record **what code, what data, and what models** produced the number, so that any third party can reproduce it exactly[reference:3].
