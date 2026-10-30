// Éléments communs aux commandes omikuji:index, omikuji et omikuji:search.
import path from "node:path";

export const OLLAMA = process.env.OLLAMA_HOST ?? "http://localhost:11434";
export const EMBED_MODEL = "embeddinggemma-2:latest";
export const OMIKUJI_DIR = path.join(process.cwd(), "data", "omikuji");
export const EMBEDDINGS_FILE = path.join(OMIKUJI_DIR, "embeddings.json");
export const CLEAR_DIR = path.join(OMIKUJI_DIR, "clear");
export const DRAWS_DIR = path.join(OMIKUJI_DIR, "draws");

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
