import { getAssetDir } from "@/libs/assets";
import { prisma } from "@/libs/prisma";
import { invalidateScanIndex } from "@/libs/scan-search";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

export const THUMBNAIL_SIZE = 512;
export const MAX_THUMBNAIL_UPLOAD_BYTES = 15 * 1024 * 1024;

const THUMBNAIL_URL_PREFIX = "/api/assets/thumbnails/";

/**
 * Convertit une capture (PNG transparent) en AVIF carré, l'enregistre dans
 * data/thumbnails et la définit comme miniature du scan. Le nom de fichier
 * change à chaque appel pour contourner le cache de l'API d'assets.
 */
export async function setScanThumbnail(
  scan: { id: string; slug: string; thumbnail: string | null },
  image: Buffer,
): Promise<string> {
  const avif = await sharp(image)
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: "cover" })
    .avif({ quality: 60 })
    .toBuffer();

  const dir = getAssetDir("thumbnails");
  await mkdir(dir, { recursive: true });

  const filename = `${scan.slug}-${Date.now()}.avif`;
  await writeFile(path.join(dir, filename), avif);

  const thumbnail = `${THUMBNAIL_URL_PREFIX}${filename}`;
  await prisma.scan.update({
    where: { id: scan.id },
    data: { thumbnail },
    select: { id: true },
  });
  invalidateScanIndex();

  // Supprime l'ancienne miniature seulement si elle vient de cet outil.
  if (scan.thumbnail?.startsWith(THUMBNAIL_URL_PREFIX)) {
    await unlink(
      path.join(
        dir,
        path.basename(scan.thumbnail.slice(THUMBNAIL_URL_PREFIX.length)),
      ),
    ).catch(() => {});
  }

  return thumbnail;
}
