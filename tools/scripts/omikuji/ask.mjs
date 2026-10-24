// Tire un omikuji à partir d'une question, en s'appuyant sur les embeddings générés par omikuji:index.
// Pipeline : embeddinggemma-2 (récupération) -> nimble (rang de chance) -> gemma4 (rédaction).
// Chaque tirage est enregistré dans data/omikuji/draws/ (un fichier markdown par omikuji).
// Prérequis : Ollama lancé en local. Usage : yarn omikuji "Dois-je changer de travail ?"
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DRAWS_DIR, EMBEDDINGS_FILE, embed, post } from "./shared.mjs";

const CLASSIFY_MODEL = "nimble:latest";
const WRITE_MODEL = "gemma4:31b-mlx";
const TOP_K = 4;

const LUCK = {
  A: { name: "Dai-kichi 大吉", label: "grande bénédiction" },
  B: { name: "Kichi 吉", label: "bénédiction" },
  C: { name: "Shō-kichi 小吉", label: "petite bénédiction" },
  D: { name: "Han-kichi 半吉", label: "demi-bénédiction" },
  E: { name: "Sue-kichi 末吉", label: "future bénédiction" },
  F: { name: "Sue-shō-kichi 末小吉", label: "future petite bénédiction" },
  G: { name: "Kyō 凶", label: "malheur" },
};

const cosine = (a, b) => {
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

const retrieve = async (items, question) => {
  const [query] = await embed([question]);
  return items
    .map((item) => ({ ...item, score: cosine(query, item.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);
};

// nimble ne renvoie qu'une lettre : on lui donne le schéma et les passages comme données.
const classify = async (question, passages) => {
  const choices = Object.entries(LUCK)
    .map(([code, { label }]) => `  ${code}: ${label}`)
    .join("\n");
  const context = passages.map((p) => `- ${p.text.replace(/\n+/g, " ")}`).join("\n");
  const { message } = await post("/api/chat", {
    model: CLASSIFY_MODEL,
    stream: false,
    think: false,
    options: { temperature: 0 },
    messages: [
      {
        role: "user",
        content: `Schema:\nfield "fortune": le rang de chance que les passages promettent à la question.\nchoices:\n${choices}\n\nContext:\nQuestion : ${question}\nPassages :\n${context}\n\nRequested field: fortune`,
      },
    ],
  });
  const code = message.content.trim().charAt(0).toUpperCase();
  return LUCK[code] ? code : "C";
};

const write = async (question, passages, luck) => {
  const context = passages.map((p, i) => `[${i + 1}] (${p.source}) ${p.text}`).join("\n");
  const { message } = await post("/api/chat", {
    model: WRITE_MODEL,
    stream: false,
    think: false,
    messages: [
      {
        role: "system",
        content:
          "Tu écris des omikuji, ces papiers de fortune des sanctuaires japonais, en français. " +
          "Appuie-toi uniquement sur les passages fournis : reprends leurs images, ne rien inventer d'étranger à eux. " +
          "Le rang de chance est imposé, ne le change pas. Sois bref, sobre, poétique, sans emoji.",
      },
      {
        role: "user",
        content:
          `Question : ${question}\nRang imposé : ${luck.name} (${luck.label})\n\nPassages :\n${context}\n\n` +
          "Format :\n1. un poème de trois lignes\n2. « Réponse : » deux phrases qui répondent à la question\n3. « Conseil : » une phrase",
      },
    ],
  });
  return message.content.trim();
};

// Détecte la langue de la question ; renvoie son nom en anglais ("French", "English"...).
const detectLanguage = async (text) => {
  const { message } = await post("/api/chat", {
    model: WRITE_MODEL,
    stream: false,
    think: false,
    options: { temperature: 0 },
    messages: [
      {
        role: "user",
        content: `Name the language of the following text. Answer with the English name of the language only, one word.\n\nText: ${text}`,
      },
    ],
  });
  return message.content.trim().replace(/[^A-Za-z -]/g, "");
};

// Traduit l'omikuji rédigé en français vers la langue de la question, en gardant la mise en forme.
const translate = async (body, language) => {
  const { message } = await post("/api/chat", {
    model: WRITE_MODEL,
    stream: false,
    think: false,
    options: { temperature: 0 },
    messages: [
      {
        role: "system",
        content: `You translate French text into ${language}. Keep the line breaks and the structure (the three-line poem, then the "Réponse :" and "Conseil :" parts, whose labels must be translated too). Keep it sober and poetic. Output only the translation.`,
      },
      { role: "user", content: body },
    ],
  });
  return message.content.trim();
};

const question = process.argv.slice(2).join(" ").trim();
if (!question) {
  console.error('Usage : yarn omikuji "ta question"');
  process.exit(1);
}
if (!existsSync(EMBEDDINGS_FILE)) {
  console.error("Embeddings introuvables : lance d'abord `yarn omikuji:index /chemin/absolu`");
  process.exit(1);
}

const { items } = JSON.parse(await readFile(EMBEDDINGS_FILE, "utf8"));
const passages = await retrieve(items, question);
const code = await classify(question, passages);
const luck = LUCK[code];
const written = await write(question, passages, luck);
const language = await detectLanguage(question);
const body = /^french$/i.test(language) ? written : await translate(written, language);

const slug = question
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 50);
const now = new Date();
const file = path.join(DRAWS_DIR, `${now.toISOString().replace(/[:.]/g, "-").slice(0, 19)}-${slug}.md`);
const sources = [...new Set(passages.map((p) => p.source))];
await mkdir(DRAWS_DIR, { recursive: true });
await writeFile(
  file,
  `---\ndate: ${now.toISOString()}\nquestion: ${JSON.stringify(question)}\nfortune: ${JSON.stringify(luck.name)}\nsources: ${JSON.stringify(sources)}\n---\n\n# ${luck.name}\n\n${body}\n`,
);

console.log(`\n  ${luck.name}\n  ${"—".repeat(14)}\n\n${body}\n`);
console.error(`Enregistré : ${path.relative(process.cwd(), file)}`);
if (process.env.DEBUG) {
  console.error("Passages :", passages.map((p) => `${p.score.toFixed(3)} ${p.source}`).join(" | "));
}
