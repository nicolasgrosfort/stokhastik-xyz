import { getAssetDir } from "@/libs/assets";
import { EmbeddingStatus, getEmbeddingStatus } from "@/libs/embeddings";
import { prisma } from "@/libs/prisma";
import { invalidateScanIndex } from "@/libs/scan-search";
import { slugify } from "@/libs/utils";
import { Prisma, ScanKind } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
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

/**
 * Enregistre le fichier dans data/models (sans écraser un fichier existant)
 * et crée le scan correspondant. Le fichier doit déjà être validé.
 */
export async function createScan(
  upload: File,
  extension: string,
  data: ScanInput,
) {
  const baseName = slugify(path.basename(upload.name, extension)) || "scan";
  const [takenSlugs, takenFiles] = await Promise.all([
    prisma.scan.findMany({ select: { slug: true } }),
    prisma.scan.findMany({ select: { file: true } }),
  ]);
  const slugs = new Set(takenSlugs.map((row) => row.slug));
  const files = new Set(takenFiles.map((row) => row.file));

  let slug = baseName;
  let file = `${slug}${extension}`;

  for (let i = 2; slugs.has(slug) || files.has(file); i++) {
    slug = `${baseName}-${i}`;
    file = `${slug}${extension}`;
  }

  const dir = getAssetDir("models");
  await mkdir(dir, { recursive: true });
  // "wx" : échoue plutôt que d'écraser un fichier présent sur le disque.
  await writeFile(
    path.join(dir, file),
    Buffer.from(await upload.arrayBuffer()),
    {
      flag: "wx",
    },
  );

  const scan = await prisma.scan.create({
    data: {
      ...data,
      slug,
      file,
      kind: KINDS[extension],
      sizeBytes: upload.size,
    },
    omit: { embedding: true },
  });
  invalidateScanIndex();

  return withStatus(scan);
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
