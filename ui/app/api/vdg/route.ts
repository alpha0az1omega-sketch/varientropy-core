import { NextResponse } from 'next/server';

const KNOWN_CORPUS = [
  "Thermodynamics and the laws of entropy in closed systems.",
  "Mutual information and deep learning neural networks.",
  "Variance and volatility in quantitative finance markets.",
  "Quantum mechanics and superposition of qubits.",
  "Genetic algorithms and evolutionary computation."
];

function getMathEmbedding(text: string, dim = 64): number[] {
  const hash = require('crypto').createHash('sha512').update(text).digest();
  const arr = [];
  for (let i = 0; i < dim; i++) arr.push(hash[i] / 255.0);
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
    if (p[i] > 0) kl += p[i] * Math.log2(p[i] / Math.max(q[i], 1e-10));
  }
  return Math.abs(kl);
}

function calculateVariance(sims: number[]): number {
  const mean = sims.reduce((a, b) => a + b, 0) / sims.length;
  const variance = sims.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sims.length;
  return Math.min(1, variance * 4);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = body.query;
    const mode = body.mode || 'math';
    const apiKey = body.apiKey;

    if (!query) return NextResponse.json({ error: "Query is required" }, { status: 400 });

    // --- MATHEMATICAL CALCULATION (Always executed) ---
    const hypVec = getMathEmbedding(query);
    const hypProbs = softmax(hypVec);
    const entropy_H = calculateEntropy(hypProbs);

    let totalKL = 0;
    let sims = [];

    for (const known of KNOWN_CORPUS) {
      const knownVec = getMathEmbedding(known);
      const knownProbs = softmax(knownVec);
      totalKL += calculateKL(hypProbs, knownProbs);
      
      let dot = 0, magA = 0, magB = 0;
      for (let i = 0; i < hypVec.length; i++) {
        dot += hypVec[i] * knownVec[i];
        magA += hypVec[i] * hypVec[i];
        magB += knownVec[i] * knownVec[i];
      }
      sims.push(dot / (Math.sqrt(magA) * Math.sqrt(magB) + 1e-12));
    }

    const mutual_info_I = Math.max(0, 1 - ((totalKL / KNOWN_CORPUS.length) / Math.log2(hypVec.length)));
    const variance_F = calculateVariance(sims);

    let score = entropy_H - mutual_info_I + (variance_F * 0.5);
    score = Math.max(0, Math.min(1, score));

    // --- CRYPTOGRAPHIC PROOF GENERATION (UTF-8 Fixed) ---
    const crypto = require('crypto');
    const hashHex = crypto.createHash('sha256').update(query, 'utf8').digest('hex');

    // --- AI ANALYSIS (Optional BYOK) ---
    let aiAnalysis = null;
    if (mode === 'ai' && apiKey) {
      try {
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: `Analyze this scientific hypothesis in 3 sentences: ${query}` }]
          })
        });
        const aiData = await aiResponse.json();
        aiAnalysis = aiData.choices?.[0]?.message?.content || "AI analysis error.";
      } catch (e) {
        aiAnalysis = "Failed to connect to the AI API.";
      }
    }

    return NextResponse.json({
      engine: mode === 'ai' ? 'Scientific (AI)' : 'Mathematical (Deterministic)',
      hypothesis: query,
      metrics: {
        entropy_H: entropy_H.toFixed(4),
        mutual_info_I: mutual_info_I.toFixed(4),
        variance_F: variance_F.toFixed(4),
        divergence_score: score.toFixed(4),
      },
      ai_analysis: aiAnalysis,
      cryptographic_proof: {
        hash: hashHex,
        timestamp_utc: new Date().toISOString(),
      }
    }, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
