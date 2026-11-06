import { NextResponse } from 'next/server';
import { pipeline } from '@xenova/transformers';

export async function GET() {
  try {
    // Force le chargement du modèle en mémoire
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    await extractor("warmup", { pooling: 'mean', normalize: true });
    return NextResponse.json({ status: "Model is warm and ready." });
  } catch (error) {
    return NextResponse.json({ status: "Failed to warm up" }, { status: 500 });
  }
}
