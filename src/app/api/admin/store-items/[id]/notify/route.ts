import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { notifyNewsletterSubscribers } from "@/libs/store-item";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const { id } = await params;
  const body: unknown = await request.json();

  if (
    typeof body !== "object" ||
    body === null ||
    !("isNew" in body) ||
    typeof body.isNew !== "boolean"
  ) {
    return NextResponse.json(
      { error: "Merci de préciser s'il s'agit d'un nouvel item ou d'une mise à jour." },
      { status: 400 },
    );
  }

  const item = await prisma.storeItem.findUnique({ where: { id } });

  if (!item) {
    return NextResponse.json({ error: "Item introuvable." }, { status: 404 });
  }

  try {
    await notifyNewsletterSubscribers(item, { isNew: body.isNew });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erreur envoi newsletter store item :", error);

    return NextResponse.json(
      { error: "Impossible d'envoyer la newsletter." },
      { status: 500 },
    );
  }
}
