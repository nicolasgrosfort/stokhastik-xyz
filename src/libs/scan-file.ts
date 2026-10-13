import { slugify } from "@/libs/utils";

const DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})-(.+)$/;

/** Slug de base et date de capture déduits d'un nom de fichier "AAAA-MM-JJ-nom.ply". */
export function parseModelFileName(file: string): {
  slugBase: string;
  name: string;
  capturedAt: string | null;
} {
  const base = file.replace(/\.[^.]+$/, "");
  const match = DATE_PREFIX.exec(base);
  const slugBase = slugify(match ? match[2] : base) || "scan";
  const text = slugBase.replace(/-/g, " ");

  return {
    slugBase,
    name: text.charAt(0).toUpperCase() + text.slice(1),
    capturedAt: match ? match[1] : null,
  };
}
