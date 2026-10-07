import { prisma } from "@/libs/prisma";
import { Prisma } from "@prisma/client";

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

export type ScanListItem = Prisma.ScanGetPayload<typeof scanListArgs>;

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
      (rawTags as string[]).map((tag) => tag.trim().toLowerCase()).filter(Boolean),
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

export function listScans() {
  return prisma.scan.findMany(scanListArgs);
}

export function getScan(id: string) {
  return prisma.scan.findUnique({ where: { id } });
}

export function updateScan(id: string, data: ScanInput) {
  return prisma.scan.update({
    where: { id },
    data,
    omit: { embedding: true },
  });
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
