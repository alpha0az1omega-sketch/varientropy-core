# Varientropy: A Mathematical Framework for Divergent Meta-AI

## Abstract
While "Varientropy" (Variable Entropy) is known in statistical thermodynamics, its application to Generative AI remains unexplored. This paper proposes a novel bridge: applying the Varientropy formula \(H(X) - I(X;Y) + Var(f)\) to filter AI-generated hypotheses.

## 1. The Problem of Convergent AI
Current LLMs are compression engines. They optimize for probability, leading to repetitive, converged outputs.

## 2. The Varientropy Solution
We define Divergence \(Div(h)\) as the difference between the entropy of a hypothesis and its mutual information with a known corpus.
*(Insert mathematical proof here)*

## 3. Falsifiability & Automated Validation
We introduce a novel protocol: The "AI-Judge Benchmark" (`benchmark.py`). Instead of waiting for human peer-review, we use an independent LLM to score novelty. If the Spearman correlation between VDG scores and AI-Judge scores is > 0.7, the hypothesis is validated.

## 4. Conclusion
Varientropy is not a new thermodynamic law; it is an application of information theory to the generation of novel concepts.
