// Tire un omikuji à partir d'une question, en s'appuyant sur les embeddings générés par fragment:index.
// Pipeline : embeddinggemma-2 (récupération) -> nimble (rang de chance) -> gemma4 (rédaction).
// Chaque tirage est enregistré dans data/omikuji/draws/ (un fichier markdown par omikuji).
// Prérequis : Ollama lancé en local. Usage : yarn omikuji "Dois-je changer de travail ?"
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DRAWS_DIR, EMBEDDINGS_FILE, cosine, embed, post } from "./shared.mjs";

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
          "Le rang de chance est imposé, ne le change pas, mais ne le nomme ni ne le répète dans le texte : il est déjà affiché ailleurs. " +
          "Pas de titre ni d'en-tête. Sois bref, sobre, poétique, sans emoji.",
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

// Largeur d'affichage : les caractères CJK occupent deux colonnes.
const cells = (str) => [...str].reduce((n, c) => n + (/[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\uff00-\uff60]/.test(c) ? 2 : 1), 0);
const pad = (str, width) => str + " ".repeat(Math.max(0, width - cells(str)));

const wrap = (text, width) => {
  const lines = [];
  for (const raw of text.split("\n")) {
    let line = "";
    for (const word of raw.split(/\s+/).filter(Boolean)) {
      if (line && cells(`${line} ${word}`) > width) {
        lines.push(line);
        line = word;
      } else line = line ? `${line} ${word}` : word;
    }
    lines.push(line);
  }
  return lines;
};

const KANJI = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const kanjiNumber = (n) => {
  if (n >= 100) return String(n);
  const tens = Math.floor(n / 10);
  return `${tens > 1 ? KANJI[tens] : ""}${tens ? "十" : ""}${KANJI[n % 10]}`;
};

// Mise en page d'un omikuji de sanctuaire : une bordure épaisse dessine le papier. De haut en bas :
// le numéro (hors cadre), le premier cadre fin (rang et type de chance), le second (corps du texte,
// dont les blocs sont séparés par un court filet), puis le nom du sanctuaire (hors cadre).
const SHRINE = "stokhastik";

const box = (lines, width, margin) => {
  const row = (text) => `│${pad(`${" ".repeat(margin)}${text}`, width)}│`;
  return [`┌${"─".repeat(width)}┐`, row(""), ...lines.map(row), row(""), `└${"─".repeat(width)}┘`];
};

const center = (text, width) => " ".repeat(Math.max(0, Math.floor((width - cells(text)) / 2))) + text;

const frame = (number, luck, body, width = 34) => {
  const margin = 3;
  const inner = width - 2 * margin;
  const [romaji, kanji] = luck.name.split(" ");
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  const head = [
    center(kanji.split("").join(" "), inner),
    "",
    ...wrap(`${romaji} · ${luck.label}`, inner).map((l) => center(l, inner)),
  ];
  const text = blocks.flatMap((block, i) => [
    ...(i ? ["", center("╌ ".repeat(7).trim(), inner), ""] : []),
    ...wrap(block, inner),
  ]);

  const gap = 2;
  const content = [
    center(`おみくじ　第${kanjiNumber(number)}番`, width + 2),
    "",
    ...box(head, width, margin),
    "",
    "",
    "",
    ...box(text, width, margin),
    "",
    center(SHRINE, width + 2),
  ];
  const outerWidth = width + 2 + 2 * gap;
  const edge = " ".repeat(gap);
  const blank = `┃${" ".repeat(outerWidth)}┃`;
  return [
    `┏${"━".repeat(outerWidth)}┓`,
    blank,
    ...content.map((line) => `┃${edge}${pad(line, width + 2)}${edge}┃`),
    blank,
    `┗${"━".repeat(outerWidth)}┛`,
  ].join("\n");
};

const question = process.argv.slice(2).join(" ").trim();
if (!question) {
  console.error('Usage : yarn omikuji "ta question"');
  process.exit(1);
}
if (!existsSync(EMBEDDINGS_FILE)) {
  console.error("Embeddings introuvables : lance d'abord `yarn fragment:index /chemin/absolu`");
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
  `---\ncréation: ${now.toISOString().slice(0, 10)}\nfortune: ${luck.name}\nfragments:\n${sources.map((s) => `  - ${JSON.stringify(`[[${path.basename(s, ".md")}]]`)}`).join("\n")}\nquestion: ${JSON.stringify(question)}\n---\n# ${luck.label[0].toUpperCase()}${luck.label.slice(1)}\n\n${body}\n`,
);

const number = (await readdir(DRAWS_DIR)).filter((f) => f.endsWith(".md")).length;
console.log(`\n${frame(number, luck, body)}\n`);
console.log(`Sources :\n${sources.map((s) => `  - ${s}`).join("\n")}\n`);
console.error(`Enregistré : ${path.relative(process.cwd(), file)}`);
if (process.env.DEBUG) {
  console.error("Passages :", passages.map((p) => `${p.score.toFixed(3)} ${p.source}`).join(" | "));
}
