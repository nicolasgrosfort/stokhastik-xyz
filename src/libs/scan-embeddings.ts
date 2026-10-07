import {
  buildScanText,
  computeEmbeddingHash,
  getEmbeddingStatus,
} from "@/libs/embeddings";
import { embed, getEmbeddingModel } from "@/libs/openrouter";
import { prisma } from "@/libs/prisma";
import { invalidateScanIndex } from "@/libs/scan-search";

export type EmbeddingMode = "missing" | "stale" | "all";

export type GenerateEmbeddingsResult = {
  updated: number;
  failed: { id: string; error: string }[];
};

const BATCH_SIZE = 50;

export function isEmbeddingMode(value: unknown): value is EmbeddingMode {
  return value === "missing" || value === "stale" || value === "all";
}

/**
 * Génère (ou régénère) les embeddings. `ids` prime sur `mode`.
 * - missing : scans sans embedding
 * - stale   : scans sans embedding ou dont le texte/modèle a changé
 * - all     : tous les scans
 */
export async function generateScanEmbeddings({
  ids,
  mode,
}: {
  ids?: string[];
  mode?: EmbeddingMode;
}): Promise<GenerateEmbeddingsResult> {
  const scans = await prisma.scan.findMany({
    where: ids ? { id: { in: ids } } : undefined,
    omit: { embedding: true },
  });

  const targets = ids
    ? scans
    : scans.filter((scan) => {
        if (mode === "all") return true;
        const status = getEmbeddingStatus(scan);
        return mode === "missing" ? status === "missing" : status !== "fresh";
      });

  const model = getEmbeddingModel();
  const result: GenerateEmbeddingsResult = { updated: 0, failed: [] };

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    const texts = batch.map(buildScanText);

    try {
      const vectors = await embed(texts, model);

      await prisma.$transaction(
        batch.map((scan, index) =>
          prisma.scan.update({
            where: { id: scan.id },
            data: {
              embedding: vectors[index],
              embeddingModel: model,
              embeddingHash: computeEmbeddingHash(texts[index], model),
            },
            select: { id: true },
          }),
        ),
      );

      result.updated += batch.length;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue.";
      console.error("Erreur génération embeddings :", error);
      result.failed.push(
        ...batch.map((scan) => ({ id: scan.id, error: message })),
      );
    }
  }

  invalidateScanIndex();

  return result;
}
