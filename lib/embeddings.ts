import "server-only";

import { pipeline } from "@xenova/transformers";
import type { FeatureExtractionPipeline } from "@xenova/transformers";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return extractorPromise;
}

export async function createEmbedding(input: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(input, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data as Float32Array);
}

export function chunkText(content: string, chunkSize = 1000, overlap = 200): string[] {
  const text = content.replace(/\s+/g, " ").trim();

  if (!text) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }
    if (end === text.length) {
      break;
    }
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}
