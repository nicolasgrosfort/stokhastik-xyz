// Évalue la pertinence de la recherche sémantique avec un LLM comme juge.
// Usage : yarn eval:search [--k=5]
// Prérequis : embeddings générés (admin /admin/scans) avec l'EMBEDDING_MODEL courant.
import { chatJson, getEmbeddingModel, getJudgeModel } from "@/libs/openrouter";
import { prisma } from "@/libs/prisma";
import { searchScans } from "@/libs/scan-search";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type EvalQuery = {
  query: string;
  lang: string;
  relevantSlugContains?: string[];
};

type JudgedResult = {
  id: string;
  slug: string;
  name: string;
  score: number;
  grade: number;
};

const k = Number(process.argv.find((a) => a.startsWith("--k="))?.slice(4)) || 5;
const RELEVANT_GRADE = 2;

const SYSTEM_PROMPT = `Tu évalues un moteur de recherche de scans 3D (lieux et objets photographiés, surtout au Japon).
Pour une requête utilisateur et une liste de résultats (nom, description, tags, lieu), note chaque résultat :
0 = sans rapport, 1 = lien lointain, 2 = pertinent, 3 = exactement ce que cherche l'utilisateur.
Ne juge que sur les informations fournies. Réponds uniquement en JSON : {"grades":[{"id":"...","grade":0}]}`;

const dcg = (grades: number[]) =>
  grades.reduce(
    (sum, grade, i) => sum + (2 ** grade - 1) / Math.log2(i + 2),
    0,
  );

async function judge(query: string, results: { id: string }[]) {
  const ids = results.map((r) => r.id);
  const rows = await prisma.scan.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      description: true,
      tags: true,
      location: true,
    },
  });
  const candidates = ids.map((id) => rows.find((row) => row.id === id));

  const { grades } = await chatJson<{
    grades: { id: string; grade: number }[];
  }>(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify({ query, results: candidates }) },
    ],
    getJudgeModel(),
  );

  return new Map(grades.map((g) => [g.id, Math.max(0, Math.min(3, g.grade))]));
}

const { queries } = JSON.parse(
  await readFile(path.join(import.meta.dirname, "queries.json"), "utf8"),
) as { queries: EvalQuery[] };

const indexed = await prisma.scan.count({
  where: { embeddingModel: getEmbeddingModel() },
});

if (indexed === 0) {
  console.error(
    `Aucun embedding pour le modèle ${getEmbeddingModel()}. Génère-les depuis /admin/scans.`,
  );
  process.exit(1);
}

console.log(
  `Embedding : ${getEmbeddingModel()} (${indexed} scans) · Juge : ${getJudgeModel()} · k=${k}\n`,
);

const report: {
  query: string;
  lang: string;
  ndcg: number;
  precision: number;
  top1Grade: number;
  hit: boolean | null;
  results: JudgedResult[];
}[] = [];

for (const item of queries) {
  // minScore 0 : on juge le classement brut, le seuil se règle ensuite.
  const found = await searchScans(item.query, { limit: k, minScore: 0 });
  const grades = found.length > 0 ? await judge(item.query, found) : new Map();

  const results = found.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    score: Number(r.score.toFixed(4)),
    grade: grades.get(r.id) ?? 0,
  }));

  const gradeList = results.map((r) => r.grade);
  const ideal = dcg([...gradeList].sort((a, b) => b - a));

  report.push({
    query: item.query,
    lang: item.lang,
    ndcg: ideal > 0 ? dcg(gradeList) / ideal : 0,
    precision:
      results.length > 0
        ? gradeList.filter((g) => g >= RELEVANT_GRADE).length / results.length
        : 0,
    top1Grade: gradeList[0] ?? 0,
    hit: item.relevantSlugContains
      ? results.some((r) =>
          item.relevantSlugContains!.some((part) => r.slug.includes(part)),
        )
      : null,
    results,
  });
}

const mean = (values: number[]) =>
  values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
const withHit = report.filter((r) => r.hit !== null);

console.table(
  report.map((r) => ({
    requête: r.query,
    langue: r.lang,
    [`nDCG@${k}`]: r.ndcg.toFixed(2),
    [`P@${k}`]: r.precision.toFixed(2),
    "note top 1": r.top1Grade,
    "score top 1": r.results[0]?.score ?? "-",
    attendu: r.hit === null ? "-" : r.hit ? "oui" : "NON",
  })),
);

// Aide au réglage de SEARCH_MIN_SCORE : ce qu'on garde / écarte selon le seuil.
const flat = report.flatMap((r) => r.results);
const thresholds = [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];
console.log("\nSeuil de score minimal (résultats pertinents = note ≥ 2) :");
console.table(
  thresholds.map((t) => {
    const kept = flat.filter((r) => r.score >= t);
    return {
      seuil: t,
      gardés: kept.length,
      "dont pertinents": kept.filter((r) => r.grade >= RELEVANT_GRADE).length,
      "pertinents perdus": flat.filter(
        (r) => r.score < t && r.grade >= RELEVANT_GRADE,
      ).length,
    };
  }),
);

const summary = {
  embeddingModel: getEmbeddingModel(),
  judgeModel: getJudgeModel(),
  k,
  queries: report.length,
  meanNdcg: mean(report.map((r) => r.ndcg)),
  meanPrecision: mean(report.map((r) => r.precision)),
  meanTop1Grade: mean(report.map((r) => r.top1Grade)),
  expectedHitRate: withHit.length
    ? withHit.filter((r) => r.hit).length / withHit.length
    : null,
  failed: report
    .filter((r) => r.top1Grade < RELEVANT_GRADE)
    .map((r) => r.query),
};

console.log(`\nnDCG@${k} moyen : ${summary.meanNdcg.toFixed(3)}`);
console.log(`P@${k} moyenne  : ${summary.meanPrecision.toFixed(3)}`);
console.log(`Note top 1 moy. : ${summary.meanTop1Grade.toFixed(2)} / 3`);
if (summary.expectedHitRate !== null) {
  console.log(
    `Attendus trouvés : ${(summary.expectedHitRate * 100).toFixed(0)} %`,
  );
}
if (summary.failed.length > 0) {
  console.log(
    `Requêtes en échec (top 1 < ${RELEVANT_GRADE}) : ${summary.failed.join(" · ")}`,
  );
}

const dir = path.join(import.meta.dirname, "reports");
await mkdir(dir, { recursive: true });
const file = path.join(
  dir,
  `${new Date().toISOString().replace(/[:.]/g, "-")}-${getEmbeddingModel().replace(/\//g, "_")}.json`,
);
await writeFile(file, JSON.stringify({ summary, report }, null, 2));
console.log(`\nRapport : ${path.relative(process.cwd(), file)}`);

await prisma.$disconnect();
