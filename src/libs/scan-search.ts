import { getEmbeddingModel, embed } from "@/libs/openrouter";
import { prisma } from "@/libs/prisma";
import { cosineSimilarity } from "@/libs/similarity";

export type ScanSearchResult = {
  id: string;
  slug: string;
  file: string;
  kind: "GLB" | "PLY";
  name: string;
  thumbnail: string | null;
  score: number;
};

type IndexedScan = Omit<ScanSearchResult, "score"> & {
  tags: string[];
  vector: number[];
};

const INDEX_TTL_MS = 60_000;
const QUERY_CACHE_SIZE = 100;
const NAME_BOOST = 0.05;
const TAG_BOOST = 0.08;

// Sous ce score, un résultat est considéré non pertinent. Réglable via SEARCH_MIN_SCORE.
export const getMinScore = (): number =>
  Number(process.env.SEARCH_MIN_SCORE) || 0.25;

let index: { model: string; loadedAt: number; scans: IndexedScan[] } | null =
  null;
const queryCache = new Map<string, number[]>();

/** À appeler quand des embeddings ou métadonnées changent. */
export function invalidateScanIndex() {
  index = null;
}

async function loadIndex(model: string): Promise<IndexedScan[]> {
  if (
    index &&
    index.model === model &&
    Date.now() - index.loadedAt < INDEX_TTL_MS
  ) {
    return index.scans;
  }

  // Les vecteurs d'un autre modèle n'ont ni la même dimension ni le même espace.
  const rows = await prisma.scan.findMany({
    where: { embeddingModel: model },
    select: {
      id: true,
      slug: true,
      file: true,
      kind: true,
      name: true,
      thumbnail: true,
      tags: true,
      embedding: true,
    },
  });

  const scans = rows.flatMap<IndexedScan>(({ embedding, tags, ...row }) =>
    Array.isArray(embedding)
      ? [
          {
            ...row,
            tags: Array.isArray(tags)
              ? tags.filter((tag): tag is string => typeof tag === "string")
              : [],
            vector: embedding as number[],
          },
        ]
      : [],
  );

  index = { model, loadedAt: Date.now(), scans };
  return scans;
}

async function embedQuery(query: string, model: string): Promise<number[]> {
  const key = `${model}\n${query}`;
  const cached = queryCache.get(key);

  if (cached) {
    // LRU : on remet l'entrée en fin de Map.
    queryCache.delete(key);
    queryCache.set(key, cached);
    return cached;
  }

  const [vector] = await embed([query], model);
  queryCache.set(key, vector);

  if (queryCache.size > QUERY_CACHE_SIZE) {
    queryCache.delete(queryCache.keys().next().value as string);
  }

  return vector;
}

// Boost hybride : un mot de la requête qui est un tag exact ou apparaît dans le nom.
function keywordBoost(query: string, scan: IndexedScan): number {
  const words = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 3);

  const name = scan.name.toLowerCase();
  let boost = 0;

  if (words.some((word) => scan.tags.includes(word))) boost += TAG_BOOST;
  if (words.some((word) => name.includes(word))) boost += NAME_BOOST;

  return boost;
}

export async function searchScans(
  query: string,
  {
    limit = 8,
    minScore = getMinScore(),
  }: { limit?: number; minScore?: number } = {},
): Promise<ScanSearchResult[]> {
  const text = query.trim();
  if (!text) return [];

  const model = getEmbeddingModel();
  const [scans, vector] = await Promise.all([
    loadIndex(model),
    embedQuery(text, model),
  ]);

  return scans
    .map(({ vector: scanVector, tags: _tags, ...scan }, i) => ({
      ...scan,
      score:
        cosineSimilarity(vector, scanVector) + keywordBoost(text, scans[i]),
    }))
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
