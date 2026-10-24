// Génère l'index d'embeddings à partir d'un dossier de fichiers markdown (récursif).
// Usage : yarn omikuji:index [/chemin/absolu]   (sans argument, le chemin vient de OMIKUJI_CORPUS, lu dans .env)
// Les passages inchangés réutilisent leur vecteur de l'index précédent.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { EMBED_MODEL, EMBEDDINGS_FILE, embed } from "./shared.mjs";

const CHUNK_SIZE = 700;
const BATCH_SIZE = 32;

const sha = (text) => createHash("sha1").update(text).digest("hex");

const listMarkdown = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => path.join(e.parentPath, e.name))
    .sort();
};

const stripFrontmatter = (raw) => raw.replace(/^---\n[\s\S]*?\n---\n/, "");

// Extrait d'une note la section d'un intertitre (jusqu'au prochain intertitre de même niveau ou supérieur)
// ou le paragraphe portant un identifiant de bloc (^id).
const extract = (body, fragment) => {
  if (!fragment) return body;
  if (fragment.startsWith("^")) {
    const block = body.split(/\n{2,}/).find((b) => b.trimEnd().endsWith(fragment));
    return block ?? "";
  }
  const lines = body.split("\n");
  const level = (line) => line.match(/^(#{1,6})\s/)?.[1].length ?? 0;
  const start = lines.findIndex((l) => level(l) && l.replace(/^#+\s*/, "").trim().toLowerCase() === fragment.trim().toLowerCase());
  if (start < 0) return "";
  const end = lines.findIndex((l, i) => i > start && level(l) && level(l) <= level(lines[start]));
  return lines.slice(start, end < 0 ? undefined : end).join("\n");
};

// Résout la syntaxe Obsidian : transclusions ![[Note#Section]] remplacées par leur contenu (récursif,
// sans boucle), embeds non markdown supprimés, liens [[Note|alias]] réduits à leur texte, commentaires %%…%% retirés.
// Les identifiants de bloc (^id) sont conservés pendant la résolution, puis retirés du texte final.
const MAX_DEPTH = 5;
const resolveObsidian = (raw, notes, trail = []) => {
  const text = stripFrontmatter(raw)
    .replace(/%%[\s\S]*?%%/g, "")
    .replace(/!\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|[^\]]*)?\]\]/g, (_, target, fragment) => {
      const name = target.trim().toLowerCase().replace(/\.md$/, "");
      const note = notes.get(name);
      if (!note || trail.includes(name) || trail.length >= MAX_DEPTH) return "";
      const body = resolveObsidian(note, notes, [...trail, name]);
      return `\n\n${extract(body, fragment).trim()}\n\n`;
    })
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "");
  return text
    .replace(/\[\[([^\]|#]*)(?:#[^\]|]*)?\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]|#]+)(?:#([^\]|]+))?\]\]/g, (_, target, fragment) => fragment ?? target);
};

// Découpe un fichier en passages : paragraphes regroupés jusqu'à CHUNK_SIZE caractères,
// chacun préfixé du dernier intertitre rencontré.
const chunkFile = (file, body) => {
  const source = path.basename(file, ".md");
  const chunks = [];
  let heading = "";
  let current = "";
  const flush = () => {
    if (current.trim()) chunks.push({ source, text: `${heading ? `${heading}\n` : ""}${current.trim()}` });
    current = "";
  };
  for (const block of body.split(/\n{2,}/)) {
    const text = block.trim();
    if (!text) continue;
    if (/^#{1,6}\s/.test(text)) {
      flush();
      heading = text.replace(/^#+\s*/, "");
      continue;
    }
    if (current && current.length + text.length > CHUNK_SIZE) flush();
    current += `${text}\n\n`;
  }
  flush();
  return chunks;
};

const corpus = process.argv[2] ?? process.env.OMIKUJI_CORPUS;
if (!corpus || !path.isAbsolute(corpus) || !existsSync(corpus)) {
  console.error("Usage : yarn omikuji:index [/chemin/absolu/vers/les/md] (ou définir OMIKUJI_CORPUS dans .env)");
  process.exit(1);
}

const files = await listMarkdown(corpus);
if (!files.length) {
  console.error(`Aucun fichier .md trouvé dans ${corpus}`);
  process.exit(1);
}
// Les notes sont indexées par nom (insensible à la casse) pour résoudre les [[liens]] Obsidian, quel que soit leur dossier.
const notes = new Map();
for (const file of files) notes.set(path.basename(file, ".md").toLowerCase(), await readFile(file, "utf8"));
const chunks = [];
for (const file of files) {
  const raw = notes.get(path.basename(file, ".md").toLowerCase());
  chunks.push(...chunkFile(file, resolveObsidian(raw, notes, [path.basename(file, ".md").toLowerCase()]).replace(/ \^[\w-]+$/gm, "")));
}

const previous = existsSync(EMBEDDINGS_FILE) ? JSON.parse(await readFile(EMBEDDINGS_FILE, "utf8")) : null;
const known = new Map();
if (previous?.model === EMBED_MODEL) for (const item of previous.items) known.set(sha(item.text), item.vector);

const todo = chunks.filter((c) => !known.has(sha(c.text)));
console.error(`${files.length} fichiers, ${chunks.length} passages (${todo.length} à embedder)`);
for (let i = 0; i < todo.length; i += BATCH_SIZE) {
  const batch = todo.slice(i, i + BATCH_SIZE);
  const vectors = await embed(batch.map((c) => c.text));
  batch.forEach((c, j) => known.set(sha(c.text), vectors[j]));
  console.error(`  ${Math.min(i + BATCH_SIZE, todo.length)}/${todo.length}`);
}

const items = chunks.map((c) => ({ ...c, vector: known.get(sha(c.text)) }));
await mkdir(path.dirname(EMBEDDINGS_FILE), { recursive: true });
await writeFile(EMBEDDINGS_FILE, JSON.stringify({ model: EMBED_MODEL, corpus, createdAt: new Date().toISOString(), items }));
console.error(`Index écrit : ${path.relative(process.cwd(), EMBEDDINGS_FILE)}`);
