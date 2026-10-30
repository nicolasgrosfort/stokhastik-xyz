// Interroge les fragments indexés par omikuji:index : renvoie ceux qui répondent le mieux à une question.
// Un fragment est une note entière ; son score est celui de son passage le plus proche de la question.
// Prérequis : Ollama lancé en local. Usage : yarn omikuji:search "comment on tente de dominer le monde par la technologie" [-n 5]
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { EMBEDDINGS_FILE, cosine, embed } from "./shared.mjs";

const args = process.argv.slice(2);
const flag = args.findIndex((a) => a === "-n" || a === "--top");
const top = flag >= 0 ? Number(args.splice(flag, 2)[1]) : 5;
const question = args.join(" ").trim();
if (!question || !Number.isInteger(top) || top < 1) {
  console.error('Usage : yarn omikuji:search "ta question" [-n 5]');
  process.exit(1);
}
if (!existsSync(EMBEDDINGS_FILE)) {
  console.error("Embeddings introuvables : lance d'abord `yarn omikuji:index /chemin/absolu`");
  process.exit(1);
}

const { items } = JSON.parse(await readFile(EMBEDDINGS_FILE, "utf8"));
const [query] = await embed([question]);

const best = new Map();
for (const item of items) {
  const score = cosine(query, item.vector);
  if (score > (best.get(item.source)?.score ?? -Infinity)) best.set(item.source, { ...item, score });
}
const ranked = [...best.values()].sort((a, b) => b.score - a.score).slice(0, top);

console.log(`\nQuestion : ${question}\n`);
ranked.forEach((hit, i) => {
  const [tags, ...rest] = hit.text.startsWith("Tags : ") ? hit.text.split("\n") : ["", hit.text];
  console.log(`${i + 1}. ${path.basename(hit.source, ".md")}  (${hit.score.toFixed(3)})`);
  if (tags) console.log(`   ${tags.replace("Tags : ", "#").replaceAll(", ", " #")}`);
  console.log(`   ${rest.join(" ").replace(/\s+/g, " ").trim()}\n`);
});
