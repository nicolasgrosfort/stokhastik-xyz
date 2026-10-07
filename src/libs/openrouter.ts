const BASE_URL = "https://openrouter.ai/api/v1";
const TIMEOUT_MS = 30_000;

export const DEFAULT_EMBEDDING_MODEL = "openai/text-embedding-3-small";

export const DEFAULT_JUDGE_MODEL = "anthropic/claude-haiku-4.5";

export const getJudgeModel = (): string =>
  process.env.JUDGE_MODEL || DEFAULT_JUDGE_MODEL;

export const getEmbeddingModel = (): string =>
  process.env.EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;

type EmbeddingsResponse = {
  data?: { index: number; embedding: number[] }[];
  error?: { message?: string };
};

function getHeaders(): HeadersInit {
  const apiKey = process.env.OPEN_ROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPEN_ROUTER_API_KEY est manquante.");
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    ...(process.env.SITE_URL ? { "HTTP-Referer": process.env.SITE_URL } : {}),
    "X-Title": "stokhastik",
  };
}

/** Calcule un embedding par texte, dans le même ordre que `texts`. */
export async function embed(
  texts: string[],
  model: string = getEmbeddingModel(),
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const res = await fetch(`${BASE_URL}/embeddings`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ model, input: texts }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const body = (await res
    .json()
    .catch(() => null)) as EmbeddingsResponse | null;

  if (!res.ok || !body?.data) {
    throw new Error(
      `OpenRouter (${res.status}) : ${body?.error?.message ?? "réponse invalide"}`,
    );
  }

  if (body.data.length !== texts.length) {
    throw new Error(
      `OpenRouter a renvoyé ${body.data.length} embeddings pour ${texts.length} textes.`,
    );
  }

  return [...body.data]
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

type ChatResponse = {
  choices?: { message?: { content?: string | null } }[];
  error?: { message?: string };
};

/** Appel de complétion qui renvoie un objet JSON (température 0, pour des jugements stables). */
export async function chatJson<T>(
  messages: { role: "system" | "user"; content: string }[],
  model: string,
): Promise<T> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      messages,
      temperature: 0,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS * 2),
  });

  const body = (await res.json().catch(() => null)) as ChatResponse | null;
  const content = body?.choices?.[0]?.message?.content;

  if (!res.ok || !content) {
    throw new Error(
      `OpenRouter (${res.status}) : ${body?.error?.message ?? "réponse vide"}`,
    );
  }

  // Certains modèles entourent le JSON de ```json ... ```.
  const json = content.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();

  return JSON.parse(json) as T;
}
