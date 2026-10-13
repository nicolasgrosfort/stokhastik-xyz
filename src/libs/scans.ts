import { getAssetDir, listAssetFiles } from "@/libs/assets";
import { EmbeddingStatus, getEmbeddingStatus } from "@/libs/embeddings";
import { prisma } from "@/libs/prisma";
import { invalidateScanIndex } from "@/libs/scan-search";
import { parseModelFileName } from "@/libs/scan-file";
import { Prisma, ScanKind } from "@prisma/client";
import { stat } from "fs/promises";
import path from "path";

export type ScanInput = {
  name: string;
  description: string | null;
  tags: string[];
  category: string | null;
  location: string | null;
  capturedAt: Date | null;
};

// L'embedding (gros vecteur JSON) n'est jamais renvoyé par les listes.
export const scanListArgs = {
  omit: { embedding: true },
  orderBy: [{ capturedAt: "desc" }, { name: "asc" }],
} satisfies Prisma.ScanFindManyArgs;

export type ScanListItem = Prisma.ScanGetPayload<typeof scanListArgs> & {
  embeddingStatus: EmbeddingStatus;
};

const withStatus = (
  scan: Prisma.ScanGetPayload<typeof scanListArgs>,
): ScanListItem => ({ ...scan, embeddingStatus: getEmbeddingStatus(scan) });

const optionalText = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

export function parseScanInput(
  body: unknown,
): { data: ScanInput } | { error: string } {
  if (
    typeof body !== "object" ||
    body === null ||
    !("name" in body) ||
    typeof body.name !== "string" ||
    !body.name.trim()
  ) {
    return { error: "Le nom est requis." };
  }

  const rawTags = "tags" in body ? body.tags : [];

  if (
    !Array.isArray(rawTags) ||
    rawTags.some((tag) => typeof tag !== "string")
  ) {
    return { error: "Les tags doivent être une liste de textes." };
  }

  const tags = [
    ...new Set(
      (rawTags as string[])
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];

  const rawDate = "capturedAt" in body ? body.capturedAt : null;
  let capturedAt: Date | null = null;

  if (typeof rawDate === "string" && rawDate.trim()) {
    capturedAt = new Date(rawDate);

    if (Number.isNaN(capturedAt.getTime())) {
      return { error: "Date de capture invalide." };
    }
  }

  return {
    data: {
      name: body.name.trim(),
      description: optionalText("description" in body && body.description),
      tags,
      category: optionalText("category" in body && body.category),
      location: optionalText("location" in body && body.location),
      capturedAt,
    },
  };
}

export async function listScans(): Promise<ScanListItem[]> {
  return (await prisma.scan.findMany(scanListArgs)).map(withStatus);
}

export function getScan(id: string) {
  return prisma.scan.findUnique({ where: { id } });
}

// Même forme que les lignes de la liste (sans le vecteur d'embedding).
export async function getScanForList(id: string) {
  const scan = await prisma.scan.findUnique({
    where: { id },
    omit: { embedding: true },
  });

  return scan && withStatus(scan);
}

export async function updateScan(id: string, data: ScanInput) {
  const scan = await prisma.scan.update({
    where: { id },
    data,
    omit: { embedding: true },
  });
  invalidateScanIndex();

  return withStatus(scan);
}

const KINDS: Record<string, ScanKind> = { ".glb": "GLB", ".ply": "PLY" };

// Fichiers de data/models qu'aucun scan ne référence encore.
export async function listAvailableModelFiles(): Promise<string[]> {
  const [files, rows] = await Promise.all([
    listAssetFiles("models"),
    prisma.scan.findMany({ select: { file: true } }),
  ]);
  const known = new Set(rows.map((row) => row.file));

  return files.filter((file) => !known.has(file));
}

/** Crée un scan pour un fichier déjà présent dans data/models. */
export async function createScan(
  file: string,
  data: ScanInput,
): Promise<{ scan: ScanListItem } | { error: string; status: number }> {
  const extension = path.extname(file).toLowerCase();

  if (!(extension in KINDS) || path.basename(file) !== file) {
    return { error: "Fichier invalide.", status: 400 };
  }

  const size = await stat(path.join(getAssetDir("models"), file))
    .then((info) => info.size)
    .catch(() => null);

  if (size === null) {
    return { error: "Fichier introuvable sur le serveur.", status: 404 };
  }

  const [slugRows, existing] = await Promise.all([
    prisma.scan.findMany({ select: { slug: true } }),
    prisma.scan.findUnique({ where: { file }, select: { id: true } }),
  ]);

  if (existing) {
    return { error: "Ce fichier est déjà utilisé par un scan.", status: 409 };
  }

  const taken = new Set(slugRows.map((row) => row.slug));
  const { slugBase } = parseModelFileName(file);
  let slug = slugBase;

  for (let i = 2; taken.has(slug); i++) slug = `${slugBase}-${i}`;

  const scan = await prisma.scan.create({
    data: { ...data, slug, file, kind: KINDS[extension], sizeBytes: size },
    omit: { embedding: true },
  });
  invalidateScanIndex();

  return { scan: withStatus(scan) };
}

// Tags déjà utilisés, pour l'autocomplétion du formulaire.
export async function listScanTags(): Promise<string[]> {
  const rows = await prisma.scan.findMany({ select: { tags: true } });

  return [
    ...new Set(
      rows.flatMap((row) =>
        Array.isArray(row.tags)
          ? row.tags.filter((tag): tag is string => typeof tag === "string")
          : [],
      ),
    ),
  ].sort((a, b) => a.localeCompare(b));
}
