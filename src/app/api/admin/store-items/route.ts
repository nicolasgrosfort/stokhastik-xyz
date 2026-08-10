import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { slugify } from "@/libs/utils";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const body: unknown = await request.json();

  if (
    typeof body !== "object" ||
    body === null ||
    !("name" in body) ||
    !("slug" in body) ||
    !("model" in body) ||
    !("thumbnail" in body) ||
    !("price" in body) ||
    !("position" in body) ||
    !("rotation" in body) ||
    !("releaseDate" in body) ||
    typeof body.name !== "string" ||
    typeof body.slug !== "string" ||
    typeof body.model !== "string" ||
    typeof body.thumbnail !== "string" ||
    typeof body.price !== "number" ||
    typeof body.position !== "number" ||
    typeof body.rotation !== "number" ||
    typeof body.releaseDate !== "string" ||
    !body.name.trim() ||
    !body.slug.trim() ||
    !body.model.trim() ||
    !body.thumbnail.trim() ||
    !Number.isFinite(body.price) ||
    body.price <= 0 ||
    !Number.isFinite(body.position) ||
    !Number.isFinite(body.rotation)
  ) {
    return NextResponse.json(
      { error: "Merci de remplir correctement tous les champs requis." },
      { status: 400 },
    );
  }

  const { name, slug, model, thumbnail, price, position, rotation, releaseDate } =
    body;

  const description =
    "description" in body &&
    typeof body.description === "string" &&
    body.description.trim()
      ? body.description
      : null;

  const parsedReleaseDate = new Date(releaseDate);

  if (Number.isNaN(parsedReleaseDate.getTime())) {
    return NextResponse.json(
      { error: "Date de sortie invalide." },
      { status: 400 },
    );
  }

  if (slugify(slug) !== slug) {
    return NextResponse.json(
      {
        error:
          "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets.",
      },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.storeItem.findUnique({ where: { slug } });

    if (existing) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé par un autre item." },
        { status: 409 },
      );
    }

    const item = await prisma.storeItem.create({
      data: {
        name,
        slug,
        description,
        model,
        thumbnail,
        price,
        position,
        rotation,
        releaseDate: parsedReleaseDate,
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error("Erreur création store item :", error);

    return NextResponse.json(
      { error: "Impossible de créer l'item." },
      { status: 500 },
    );
  }
}
