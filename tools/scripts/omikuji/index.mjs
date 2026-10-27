// Génère l'index d'embeddings à partir d'un dossier de fichiers markdown (récursif).
// Usage : yarn omikuji:index [/chemin/absolu]   (sans argument, le chemin vient de OMIKUJI_CORPUS, lu dans .env)
// Les passages inchangés réutilisent leur vecteur de l'index précédent.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { CLEAR_DIR, EMBED_MODEL, EMBEDDINGS_FILE, embed } from "./shared.mjs";

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

// Les noms de fichiers macOS sont en NFD, les liens Obsidian en NFC : on compare des clés normalisées.
const noteKey = (name) => name.normalize("NFC").trim().toLowerCase().replace(/\.md$/, "");

const stripFrontmatter = (raw) => raw.replace(/^---\n[\s\S]*?\n---\n/, "");

// Lit les tags du frontmatter (liste YAML « - tag », ou « tags: [a, b] » / « tags: a, b »).
const parseTags = (raw) => {
  const front = raw.match(/^---\n([\s\S]*?)\n---/)?.[1];
  const block = front?.match(/^tags:[ \t]*(.*(?:\n[ \t]+-.*|\n-.*)*)/m)?.[1];
  if (!block) return [];
  const items = block.includes("\n") || block.trimStart().startsWith("-")
    ? block.split("\n").map((l) => l.replace(/^\s*-\s*/, ""))
    : block.replace(/^\[|\]$/g, "").split(",");
  return items.map((t) => t.trim().replace(/^["']|["']$/g, "").replace(/^#/, "")).filter(Boolean);
};

// Extrait d'une note la section d'un intertitre (jusqu'au prochain intertitre de même niveau ou supérieur)
// ou le paragraphe portant un identifiant de bloc (^id).
const extract = (body, fragment) => {
  if (!fragment) return body;
  if (fragment.startsWith("^")) {
    // Le bloc est le paragraphe qui se termine par l'identifiant (il peut être collé à l'intertitre suivant).
    const lines = body.split("\n");
    const end = lines.findIndex((l) => l.trimEnd().endsWith(fragment));
    if (end < 0) return "";
    let start = end;
    while (start > 0 && lines[start - 1].trim() && !/^#{1,6}\s/.test(lines[start - 1])) start--;
    return lines.slice(start, end + 1).join("\n");
  }
  const lines = body.split("\n");
  const level = (line) => line.match(/^(#{1,6})\s/)?.[1].length ?? 0;
  // Comparaison souple, comme Obsidian : crochets et ponctuation ignorés (le lien [[N#Titre [FR]]] est coupé au premier ]]).
  const norm = (t) => t.replace(/[\[\]#^|:]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  const start = lines.findIndex((l) => level(l) && norm(l.replace(/^#+\s*/, "")) === norm(fragment));
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
      const name = noteKey(target);
      const note = notes.get(name) ?? notes.get(`${name}.md`);
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
const chunkFile = (source, raw) => {
  const tags = parseTags(raw);
  const body = stripFrontmatter(raw);
  const prefix = tags.length ? `Tags : ${tags.join(", ")}\n` : "";
  const chunks = [];
  let heading = "";
  let current = "";
  const flush = () => {
    if (current.trim()) chunks.push({ source, text: `${prefix}${heading ? `${heading}\n` : ""}${current.trim()}` });
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
// Les transclusions pointent souvent hors du dossier indexé : on cherche les notes dans tout le coffre
// (premier dossier parent contenant .obsidian), à défaut dans le dossier seul.
const vaultRoot = (dir) => {
  for (let d = dir; d !== path.dirname(d); d = path.dirname(d)) if (existsSync(path.join(d, ".obsidian"))) return d;
  return dir;
};
const notes = new Map();
for (const file of await listMarkdown(vaultRoot(corpus))) notes.set(noteKey(path.basename(file)), await readFile(file, "utf8"));

// Étape 1 : recrée les fichiers en clair (transclusions résolues) dans CLEAR_DIR, en reproduisant l'arborescence.
await rm(CLEAR_DIR, { recursive: true, force: true });
const sources = [];
for (const file of files) {
  const key = noteKey(path.basename(file));
  const clear = resolveObsidian(notes.get(key), notes, [key]).replace(/ \^[\w-]+$/gm, "").replace(/^\^[\w-]+$/gm, "").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  const relative = path.relative(corpus, file);
  const target = path.join(CLEAR_DIR, relative);
  await mkdir(path.dirname(target), { recursive: true });
  const tags = parseTags(notes.get(key));
  await writeFile(target, `${tags.length ? `---\ntags:\n${tags.map((t) => `  - ${t}`).join("\n")}\n---\n\n` : ""}${clear}\n`);
  sources.push(relative);
}

// Étape 2 : les passages et leurs embeddings sont construits à partir des fichiers en clair.
const chunks = [];
for (const source of sources) chunks.push(...chunkFile(source, await readFile(path.join(CLEAR_DIR, source), "utf8")));

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
