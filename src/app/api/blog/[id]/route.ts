// app/api/blog/[id]/route.ts
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const base = process.env.CRAFT_API_BASE;

  const res = await fetch(`${base}/blocks?id=${id}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Contenu introuvable" }, { status: 404 });
  }

  const block = await res.json();

  const post = {
    id: block.id,
    title: block.title || block.markdown || "Sans titre",
    status: block.properties?.status ?? null,
    content: (block.content ?? [])
      .filter((b: any) => b.type === "text" && b.markdown?.trim())
      .map((b: any) => b.markdown),
  };

  return NextResponse.json({ post });
}
