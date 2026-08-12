import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import {
  notifyNewsletterSubscribers,
  parseNotifyNewsletter,
  parseStoreItemInput,
} from "@/libs/store-item";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const body: unknown = await request.json();
  const parsed = parseStoreItemInput(body);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const existing = await prisma.storeItem.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé par un autre item." },
        { status: 409 },
      );
    }

    const item = await prisma.storeItem.create({ data: parsed.data });

    if (parseNotifyNewsletter(body)) {
      await notifyNewsletterSubscribers(item, { isNew: true });
    }

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error("Erreur création store item :", error);

    return NextResponse.json(
      { error: "Impossible de créer l'item." },
      { status: 500 },
    );
  }
}
