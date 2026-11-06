import { NextResponse } from 'next/server';
import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;

export async function GET() {
  try {
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    await extractor("warmup", { pooling: 'mean', normalize: true });
    return NextResponse.json({ status: "Model is warm and ready." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "Failed to warm up" }, { status: 500 });
  }
}
