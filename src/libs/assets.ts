import { slugify } from "@/libs/utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const ASSET_TYPES = ["models", "thumbnails"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

const ALLOWED_EXTENSIONS: Record<AssetType, string[]> = {
  models: [".glb"],
  thumbnails: [".avif"],
};

const MAX_SIZE_BYTES: Record<AssetType, number> = {
  models: 50 * 1024 * 1024,
  thumbnails: 10 * 1024 * 1024,
};

const CONTENT_TYPES: Record<string, string> = {
  ".glb": "model/gltf-binary",
  ".avif": "image/avif",
};

export function isAssetType(value: unknown): value is AssetType {
  return (
    typeof value === "string" &&
    (ASSET_TYPES as readonly string[]).includes(value)
  );
}

export function getAssetDir(type: AssetType): string {
  return path.join(process.cwd(), "data", type);
}

export function getContentType(filename: string): string {
  const extension = path.extname(filename).toLowerCase();
  return CONTENT_TYPES[extension] ?? "application/octet-stream";
}

export function validateAssetFile(
  type: AssetType,
  file: File,
): { error: string } | { extension: string } {
  const extension = path.extname(file.name).toLowerCase();

  if (!ALLOWED_EXTENSIONS[type].includes(extension)) {
    return {
      error: `Extension non autorisée. Formats acceptés : ${ALLOWED_EXTENSIONS[type].join(", ")}.`,
    };
  }

  if (file.size > MAX_SIZE_BYTES[type]) {
    return {
      error: `Fichier trop volumineux (max ${MAX_SIZE_BYTES[type] / (1024 * 1024)} Mo).`,
    };
  }

  return { extension };
}

export async function saveAssetFile(
  type: AssetType,
  file: File,
  extension: string,
): Promise<string> {
  const dir = getAssetDir(type);
  await mkdir(dir, { recursive: true });

  const baseName = slugify(path.basename(file.name, extension)) || "fichier";
  const filename = `${baseName}${extension}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/api/assets/${type}/${filename}`;
}
