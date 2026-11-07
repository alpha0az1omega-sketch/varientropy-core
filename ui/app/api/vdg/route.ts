import { NextResponse } from 'next/server';

const KNOWN_CORPUS = [
  "Thermodynamics and the laws of entropy in closed systems.",
  "Mutual information and deep learning neural networks.",
  "Variance and volatility in quantitative finance markets.",
  "Quantum mechanics and superposition of qubits.",
  "Genetic algorithms and evolutionary computation."
];

// Fonction mathématique déterministe (utilisée en mode "math")
function getMathEmbedding(text: string, dim = 64): number[] {
  const hash = require('crypto').createHash('sha512').update(text).digest();
  const arr = [];
  for (let i = 0; i < dim; i++) {
    arr.push(hash[i] / 255.0);
  }
  return arr;
}

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map(x => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / sum);
}

function calculateEntropy(probs: number[]): number {
  let ent = 0;
  for (const p of probs) if (p > 0) ent -= p * Math.log2(p);
  return ent / Math.log2(probs.length);
}

function calculateKL(p: number[], q: number[]): number {
  let kl = 0;
  for (let i = 0; i < p.length; i++) {
    if (p[i] > 0) {
      const qi = Math.max(q[i], 1e-10);
      kl += p[i] * Math.log2(p[i] / qi);
    }
  }
  return Math.abs(kl);
}

function calculateVariance(similarities: number[]): number {
  const mean = similarities.reduce((a, b) => a + b, 0) / similarities.length;
  const variance = similarities.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / similarities.length;
  return Math.min(1, variance * 4);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = body.query;
    const mode = body.mode || 'math';

    if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

    // Pour l'instant, on utilise le moteur mathématique pour garantir que ça marche
    const hypVec = getMathEmbedding(query);
    const hypProbs = softmax(hypVec);
    const entropy_H = calculateEntropy(hypProbs);

    let totalKL = 0;
    let similarities = [];

    for (const knownText of KNOWN_CORPUS) {
      const knownVec = getMathEmbedding(knownText);
      const knownProbs = softmax(knownVec);
      totalKL += calculateKL(hypProbs, knownProbs);
      
      let dot = 0, magA = 0, magB = 0;
      for (let i = 0; i < hypVec.length; i++) {
        dot += hypVec[i] * knownVec[i];
        magA += hypVec[i] * hypVec[i];
        magB += knownVec[i] * knownVec[i];
      }
      similarities.push(dot / (Math.sqrt(magA) * Math.sqrt(magB) + 1e-12));
    }

    const avgKL = totalKL / KNOWN_CORPUS.length;
    const mutual_info_I = Math.max(0, 1 - (avgKL / Math.log2(hypVec.length)));
    const variance_F = calculateVariance(similarities);

    let divergenceScore = entropy_H - mutual_info_I + (variance_F * 0.5);
    divergenceScore = Math.max(0, Math.min(1, divergenceScore));

    // Génération du Hash
    const crypto = require('crypto');
    const hashHex = crypto.createHash('sha256').update(query).digest('hex');

    return NextResponse.json({
      engine: mode === 'ai' ? 'Scientifique (Fallback Mathématique)' : 'Mathématique (Déterministe)',
      hypothesis: query,
      metrics: {
        entropy_H: entropy_H.toFixed(4),
        mutual_info_I: mutual_info_I.toFixed(4),
        variance_F: variance_F.toFixed(4),
        divergence_score: divergenceScore.toFixed(4),
      },
      cryptographic_proof: {
        hash: hashHex,
        timestamp_utc: new Date().toISOString(),
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
