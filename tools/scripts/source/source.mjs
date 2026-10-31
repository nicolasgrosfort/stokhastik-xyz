// Crée un fichier par source (sans doublon) dans data/sources/, à partir du frontmatter des fragments.
// Usage : yarn source [/chemin/absolu]   (sans argument, le chemin vient de FRAGMENTS_DIR, lu dans .env)
// Chaque fichier reprend le champ « apa » de la note source et liste les fragments qui la citent.
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { SOURCES_DIR, fragmentsDir, listMarkdown, noteKey, vaultRoot } from "../omikuji/shared.mjs";

const frontmatter = (raw) => raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";

// Valeur d'une clé du frontmatter sur une ligne, sans les guillemets YAML.
const field = (raw, key) => {
  const value = frontmatter(raw).match(new RegExp(`^${key}:[ \\t]*(.*)$`, "m"))?.[1].trim();
  if (!value) return "";
  return value.replace(/^"([\s\S]*)"$/, (_, v) => v.replace(/\\(["\\])/g, "$1")).replace(/^'([\s\S]*)'$/, (_, v) => v.replace(/''/g, "'"));
};

const wikilinkTarget = (value) => value.match(/\[\[([^\]|#]+)/)?.[1].trim();

const fragments = fragmentsDir();
if (!fragments || !path.isAbsolute(fragments) || !existsSync(fragments)) {
  console.error("Usage : yarn source [/chemin/absolu/vers/les/fragments] (ou définir FRAGMENTS_DIR dans .env)");
  process.exit(1);
}

// Notes du coffre par nom, pour retrouver l'apa de chaque source.
const notes = new Map();
for (const file of await listMarkdown(vaultRoot(fragments))) notes.set(noteKey(path.basename(file)), await readFile(file, "utf8"));

// Une entrée par source, clé normalisée pour fusionner les graphies différentes d'un même titre.
const bySource = new Map();
let withoutSource = 0;
for (const file of await listMarkdown(fragments)) {
  const raw = await readFile(file, "utf8");
  const title = wikilinkTarget(field(raw, "source"));
  if (!title) {
    withoutSource++;
    continue;
  }
  const key = noteKey(title);
  if (!bySource.has(key)) bySource.set(key, { title: notes.has(key) ? path.basename(title) : title, fragments: [] });
  bySource.get(key).fragments.push(path.basename(file, ".md").normalize("NFC"));
}

await rm(SOURCES_DIR, { recursive: true, force: true });
await mkdir(SOURCES_DIR, { recursive: true });
const missing = [];
for (const [key, { title, fragments: list }] of bySource) {
  const apa = notes.has(key) ? field(notes.get(key), "apa") : "";
  if (!apa) missing.push(title);
  const links = list.sort((a, b) => a.localeCompare(b, "fr")).map((f) => `- [[${f}]]`);
  const front = `---\napa: ${apa ? JSON.stringify(apa) : ""}\nfragments:\n${list.map((f) => `  - ${JSON.stringify(`[[${f}]]`)}`).join("\n")}\n---\n`;
  await writeFile(path.join(SOURCES_DIR, `${title.normalize("NFC")}.md`), `${front}\n${links.join("\n")}\n`);
}

console.error(`${bySource.size} sources écrites dans ${path.relative(process.cwd(), SOURCES_DIR)} (${withoutSource} fragments sans source)`);
if (missing.length) console.error(`Sans apa ou note introuvable :\n${missing.map((t) => `  - ${t}`).join("\n")}`);
