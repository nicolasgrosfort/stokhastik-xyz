import { getAssetDir, getContentType, isAssetType } from "@/libs/assets";
import { readFile, stat } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string; filename: string[] }> },
) {
  const { type, filename } = await params;

  if (!isAssetType(type)) {
    return NextResponse.json({ error: "Type de fichier invalide." }, { status: 400 });
  }

  const dir = getAssetDir(type);
  const resolved = path.join(dir, ...filename);

  if (path.dirname(resolved) !== dir) {
    return NextResponse.json({ error: "Chemin invalide." }, { status: 400 });
  }

  try {
    const [content, { size }] = await Promise.all([
      readFile(resolved),
      stat(resolved),
    ]);

    return new NextResponse(new Uint8Array(content), {
      headers: {
        "Content-Type": getContentType(resolved),
        "Content-Length": String(size),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable." }, { status: 404 });
  }
}
