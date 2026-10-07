import { authOptions } from "@/libs/auth";
import {
  EmbeddingMode,
  generateScanEmbeddings,
  isEmbeddingMode,
} from "@/libs/scan-embeddings";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  const ids =
    typeof body === "object" && body !== null && "ids" in body
      ? body.ids
      : undefined;
  const mode =
    typeof body === "object" && body !== null && "mode" in body
      ? body.mode
      : undefined;

  const validIds =
    Array.isArray(ids) &&
    ids.length > 0 &&
    ids.every((id): id is string => typeof id === "string")
      ? (ids as string[])
      : null;

  if (!validIds && !isEmbeddingMode(mode)) {
    return NextResponse.json(
      { error: "Fournir `ids` (liste non vide) ou `mode` (missing, stale, all)." },
      { status: 400 },
    );
  }

  try {
    const result = await generateScanEmbeddings(
      validIds ? { ids: validIds } : { mode: mode as EmbeddingMode },
    );

    return NextResponse.json({ ok: result.failed.length === 0, ...result });
  } catch (error) {
    console.error("Erreur génération embeddings :", error);

    return NextResponse.json(
      { error: "Impossible de générer les embeddings." },
      { status: 500 },
    );
  }
}
