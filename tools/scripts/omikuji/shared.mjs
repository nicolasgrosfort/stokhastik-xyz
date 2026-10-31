// Éléments communs aux commandes omikuji:index, omikuji, search et source.
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";

export const OLLAMA = process.env.OLLAMA_HOST ?? "http://localhost:11434";
export const EMBED_MODEL = "embeddinggemma-2:latest";
export const OMIKUJI_DIR = path.join(process.cwd(), "data", "omikuji");
export const EMBEDDINGS_FILE = path.join(OMIKUJI_DIR, "embeddings.json");
export const CLEAR_DIR = path.join(OMIKUJI_DIR, "clear");
export const DRAWS_DIR = path.join(OMIKUJI_DIR, "draws");
export const SOURCES_DIR = path.join(process.cwd(), "data", "sources");

// Dossier des fragments : FRAGMENTS_DIR, ou le premier argument de la commande.
export const fragmentsDir = () => process.argv[2] ?? process.env.FRAGMENTS_DIR;

export const listMarkdown = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => path.join(e.parentPath, e.name))
    .sort();
};

// Les noms de fichiers macOS sont en NFD, les liens Obsidian en NFC : on compare des clés normalisées.
export const noteKey = (name) => name.normalize("NFC").trim().toLowerCase().replace(/\.md$/, "");

// Les liens pointent souvent hors du dossier des fragments : on cherche les notes dans tout le coffre
// (premier dossier parent contenant .obsidian), à défaut dans le dossier seul.
export const vaultRoot = (dir) => {
  for (let d = dir; d !== path.dirname(d); d = path.dirname(d)) if (existsSync(path.join(d, ".obsidian"))) return d;
  return dir;
};

export const post = async (route, body) => {
  const res = await fetch(`${OLLAMA}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Ollama ${route} : ${res.status} ${await res.text()}`);
  return res.json();
};

export const embed = async (input) => (await post("/api/embed", { model: EMBED_MODEL, input })).embeddings;

export const cosine = (a, b) => {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};
