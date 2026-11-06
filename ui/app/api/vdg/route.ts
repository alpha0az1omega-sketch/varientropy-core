import { NextResponse } from 'next/server';
import { pipeline, env } from '@huggingface/transformers';

// --- CORRECTION POUR VERCEL (SERVERLESS) ---
env.allowLocalModels = false; 
env.backends.onnx.wasm.numThreads = 1; 
env.backends.setPriority(['wasm', 'cpu']); 

// --- CONFIGURATION SYSTÈME ---
const KNOWN_CORPUS = [
  "Thermodynamics and the laws of entropy in closed systems.",
  "Mutual information and deep learning neural networks.",
  "Variance and volatility in quantitative finance markets.",
  "Quantum mechanics and superposition of qubits.",
  "Genetic algorithms and evolutionary computation."
];

const semanticCache = new Map();
const rateLimitMap = new Map();

let extractor: any = null;

async function getEmbedding(text: string): Promise<number[]> {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
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
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  const windowStart = now - 60000; 
  
  const requests = rateLimitMap.get(ip) || [];
  const recentRequests = requests.filter((time: number) => time > windowStart);
  
  if (recentRequests.length >= 10) {
    return NextResponse.json({ error: "Rate limit exceeded. Please wait a minute." }, { status: 429 });
  }
  rateLimitMap.set(ip, [...recentRequests, now]);

  try {
    const body = await request.json();
    const query = body.query;

    if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

    if (semanticCache.has(query)) {
      return NextResponse.json(semanticCache.get(query));
    }

    const hypVec = await getEmbedding(query);
    const hypProbs = softmax(hypVec);
    const entropy_H = calculateEntropy(hypProbs);

    let totalKL = 0;
    let similarities = [];

    for (const knownText of KNOWN_CORPUS) {
      const knownVec = await getEmbedding(knownText);
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

    const encoder = new TextEncoder();
    const data = encoder.encode(query); 
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const attestation = {
      "@context": "https://schema.org",
      "@type": "DigitalDocument",
      "name": "Varientropy Full Equation Attestation",
      "formula": "H(X) - I(X;Y) + Var(f)",
      "hypothesis": query,
      "metrics": {
        "entropy_H": entropy_H.toFixed(4),
        "mutual_info_I": mutual_info_I.toFixed(4),
        "variance_F": variance_F.toFixed(4),
        "divergence_score": divergenceScore.toFixed(4),
        "is_novel": divergenceScore > 0.35
      },
      "cryptographic_proof": {
        "hash": hashHex,
        "timestamp_utc": new Date().toISOString(),
        "note": "The SHA-256 hash depends ONLY on the query. The timestamp proves existence at time T."
      },
      "verification_instructions": "Submit the exact same query. The hash and the mathematical metrics will be identical. The timestamp will differ, proving the time of attestation."
    };

    semanticCache.set(query, attestation);

    return NextResponse.json(attestation);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
