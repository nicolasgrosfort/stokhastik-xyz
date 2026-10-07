import { getEmbeddingModel } from "@/libs/openrouter";
import { createHash } from "node:crypto";

export type EmbeddingStatus = "fresh" | "stale" | "missing";

type EmbeddableScan = {
  name: string;
  description: string | null;
  tags: unknown;
  category: string | null;
  location: string | null;
  capturedAt: Date | null;
};

type ScanEmbeddingState = EmbeddableScan & {
  embeddingHash: string | null;
};

const tagsOf = (tags: unknown): string[] =>
  Array.isArray(tags)
    ? tags.filter((tag): tag is string => typeof tag === "string")
    : [];

/** Texte envoyé au modèle d'embedding : tout ce qui décrit le scan. */
export function buildScanText(scan: EmbeddableScan): string {
  const tags = tagsOf(scan.tags);

  return [
    `Nom : ${scan.name}`,
    scan.description && `Description : ${scan.description}`,
    scan.category && `Catégorie : ${scan.category}`,
    scan.location && `Lieu : ${scan.location}`,
    scan.capturedAt && `Date : ${scan.capturedAt.toISOString().slice(0, 10)}`,
    tags.length > 0 && `Tags : ${tags.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Change si le texte source ou le modèle change. */
export function computeEmbeddingHash(
  text: string,
  model: string = getEmbeddingModel(),
): string {
  return createHash("sha256").update(`${model}\n${text}`).digest("hex");
}

export function getEmbeddingStatus(scan: ScanEmbeddingState): EmbeddingStatus {
  if (!scan.embeddingHash) return "missing";

  return scan.embeddingHash === computeEmbeddingHash(buildScanText(scan))
    ? "fresh"
    : "stale";
}
