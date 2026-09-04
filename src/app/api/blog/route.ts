import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.CRAFT_API_BASE;
  const collectionId = process.env.CRAFT_TEXTES_COLLECTION_ID;

  const res = await fetch(`${base}/collections/${collectionId}/items`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 }, // cache 60s côté serveur, ajuste si besoin
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Impossible de récupérer les textes" },
      { status: res.status },
    );
  }

  const data = await res.json();

  // On ne garde que les textes publiés, et on nettoie la forme
  const posts = (data.items ?? [])
    .filter((item: any) => item.properties?.status === "Publié" && item.title)
    .map((item: any) => ({
      id: item.id,
      title: item.title,
      excerpt: item.content?.[0]?.markdown ?? "",
      content: (item.content ?? [])
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.markdown),
    }));

  return NextResponse.json({ posts });
}
