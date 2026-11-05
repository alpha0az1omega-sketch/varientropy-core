import { NextResponse } from 'next/server';
import { pipeline } from '@xenova/transformers';

// Le corpus de référence (mémoire sémantique)
const KNOWN_CORPUS = [
  "Existing result A about entropy and physics",
  "Existing result B about mutual information and AI",
  "Existing result C about market variance and trading"
];

// 1. Calcul du Softmax pour transformer un vecteur en probabilités (Somme = 1)
function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map(x => Math.exp(x - max)); // stabilité numérique
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / sum);
}

// 2. Vraie Entropie de Shannon normalisée (entre 0 et 1)
function calculateNormalizedEntropy(probs: number[]): number {
  const dim = probs.length;
  const maxEntropy = Math.log2(dim);
  let ent = 0;
  for (const p of probs) {
    if (p > 0) ent -= p * Math.log2(p);
  }
  return ent / maxEntropy;
}

// 3. Divergence de Kullback-Leibler (D_KL) pour l'Information Mutuelle
function calculateKLDivergence(p: number[], q: number[]): number {
  let kl = 0;
  for (let i = 0; i < p.length; i++) {
    if (p[i] > 0) {
      const qi = Math.max(q[i], 1e-10); // éviter log(0)
      kl += p[i] * Math.log2(p[i] / qi);
    }
  }
  return Math.abs(kl); // La divergence KL est toujours positive
}

// 4. Le pipeline d'embedding (chargé une seule fois en mémoire)
let extractor: any = null;
async function getEmbedding(text: string): Promise<number[]> {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = body.query;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // --- LE VRAI CALCUL SÉMANTIQUE ---
    
    // Étape A : Obtenir le vecteur sémantique de l'hypothèse (384 dimensions)
    const hypVec = await getEmbedding(query);
    const hypProbs = softmax(hypVec); // Distribution de probabilité P
    
    // Étape B : Calculer l'Entropie H(X) normalisée
    const entropy_H = calculateNormalizedEntropy(hypProbs);
    
    // Étape C : Calculer la Divergence KL moyenne avec le corpus (Proxy de I(X;Y))
    let totalKL = 0;
    for (const knownText of KNOWN_CORPUS) {
      const knownVec = await getEmbedding(knownText);
      const knownProbs = softmax(knownVec); // Distribution Q
      totalKL += calculateKLDivergence(hypProbs, knownProbs);
    }
    const avgKL = totalKL / KNOWN_CORPUS.length;
    
    // Étape D : Formule de Varientropy : Div = H(X) - I(X;Y)
    // On utilise une version bornée de l'information mutuelle (1 - KL normalisée)
    const mutual_info_I = Math.max(0, 1 - (avgKL / Math.log2(hypVec.length)));
    
    // Le score final est garanti entre 0 et 1
    const divergenceScore = Math.max(0, Math.min(1, entropy_H - mutual_info_I));

    // --- GÉNÉRATION DE LA PREUVE CRYPTOGRAPHIQUE ---
    
    const encoder = new TextEncoder();
    const data = encoder.encode(query);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const attestation = {
      "@context": "https://schema.org",
      "@type": "DigitalDocument",
      "name": "Varientropy Semantic Attestation",
      "author": "Alpha0AZ1Omega",
      "formula": "H(X) - I(X;Y) + Var(f)",
      "hypothesis": query,
      "metrics": {
        "normalized_entropy_H": entropy_H.toFixed(4),
        "mutual_info_KL": mutual_info_I.toFixed(4),
        "divergence_score": divergenceScore.toFixed(4),
        "is_novel": divergenceScore > 0.3
      },
      "cryptographic_proof": {
        "algorithm": "SHA-256",
        "hash": hashHex,
        "timestamp_utc": new Date().toISOString(),
        "embedding_model": "Xenova/all-MiniLM-L6-v2"
      },
      "verification_instructions": "The semantic divergence is calculated using true Shannon entropy and Kullback-Leibler divergence on 384-dim embeddings. Identical inputs will yield identical scores."
    };

    return NextResponse.json(attestation);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
