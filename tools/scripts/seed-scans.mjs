// Référence en base les fichiers de data/models (GLB + PLY), servis par /api/assets/models.
// Idempotent : les fichiers déjà en base sont ignorés, les métadonnées éditées ne sont jamais écrasées.
// Usage : yarn seed:scans
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { slugify } from "../../src/libs/utils.ts";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "data", "models");
const KINDS = { ".glb": "GLB", ".ply": "PLY" };
const DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})-(.+)$/;

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: Number(process.env.DATABASE_PORT),
    connectionLimit: 2,
  }),
});

const humanize = (slug) => {
  const text = slug.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const parseFile = (file) => {
  const base = path.basename(file, path.extname(file));
  const match = DATE_PREFIX.exec(base);
  const slugBase = slugify(match ? match[2] : base);
  const capturedAt = match ? new Date(`${match[1]}T00:00:00.000Z`) : null;
  return {
    slugBase,
    capturedAt: capturedAt && !Number.isNaN(capturedAt.getTime()) ? capturedAt : null,
  };
};

const listModels = async (dir) => {
  try {
    const entries = await readdir(dir);
    return entries
      .filter((entry) => path.extname(entry).toLowerCase() in KINDS)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
};

const takenSlugs = new Set((await prisma.scan.findMany({ select: { slug: true } })).map((s) => s.slug));
const known = new Set((await prisma.scan.findMany({ select: { file: true } })).map((s) => s.file));

let created = 0;
let skipped = 0;

for (const file of await listModels(DIR)) {
  if (known.has(file)) {
    skipped++;
    continue;
  }

  const { slugBase, capturedAt } = parseFile(file);
  let slug = slugBase;
  for (let i = 2; takenSlugs.has(slug); i++) slug = `${slugBase}-${i}`;
  takenSlugs.add(slug);

  const thumbnailPath = `/thumbnails/${slugBase}.avif`;
  const hasThumbnail = existsSync(path.join(ROOT, "public", thumbnailPath));

  await prisma.scan.create({
    data: {
      slug,
      file,
      kind: KINDS[path.extname(file).toLowerCase()],
      name: humanize(slugBase),
      tags: [],
      capturedAt,
      sizeBytes: (await stat(path.join(DIR, file))).size,
      thumbnail: hasThumbnail ? thumbnailPath : null,
    },
  });
  created++;
}

console.log(`Scans créés : ${created}, déjà présents : ${skipped}`);
await prisma.$disconnect();
