import { Embedding } from "@/data/embeddings";

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Dimension mismatch: ${a.length} vs ${b.length}. Les embeddings viennent-ils du même modèle ?`,
    );
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function findClosestEmbedding(
  vector: number[],
  candidates: Embedding[],
): { embedding: Embedding; similarity: number } | null {
  const scored = candidates.map((c) => ({
    embedding: c,
    similarity: cosineSimilarity(vector, c.embedding),
  }));

  console.log(
    scored.map(
      (s) =>
        `${s.embedding.originalText.slice(0, 25)}... → ${s.similarity.toFixed(4)}`,
    ),
  );

  return scored.reduce<{ embedding: Embedding; similarity: number } | null>(
    (closest, candidate) => {
      if (!closest || candidate.similarity > closest.similarity)
        return candidate;
      return closest;
    },
    null,
  );
}
