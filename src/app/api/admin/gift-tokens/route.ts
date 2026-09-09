import { authOptions } from "@/libs/auth";
import { sendGiftEmail } from "@/libs/mail";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const body: unknown = await request.json();

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { userId, tokens, message } = body as {
    userId?: unknown;
    tokens?: unknown;
    message?: unknown;
  };

  if (typeof userId !== "string" || !userId) {
    return NextResponse.json(
      { error: "Merci de sélectionner un utilisateur." },
      { status: 400 },
    );
  }

  if (typeof tokens !== "number" || !Number.isInteger(tokens) || tokens <= 0) {
    return NextResponse.json(
      { error: "Le nombre de STKH doit être un entier positif." },
      { status: 400 },
    );
  }

  if (message !== undefined && typeof message !== "string") {
    return NextResponse.json({ error: "Message invalide." }, { status: 400 });
  }

  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      { status: 404 },
    );
  }

  try {
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId,
          type: "BONUS",
          status: "SUCCEEDED",
          tokens,
          description: trimmedMessage || "Cadeau — STKH offerts depuis l'admin",
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { tokens: { increment: tokens } },
      }),
    ]);
  } catch (error) {
    console.error("Erreur don de STKH :", error);

    return NextResponse.json(
      { error: "Impossible de créditer l'utilisateur." },
      { status: 500 },
    );
  }

  if (user.email) {
    try {
      await sendGiftEmail({
        to: user.email,
        firstName: user.firstName ?? "",
        tokens,
        message: trimmedMessage || undefined,
      });
    } catch (error) {
      console.error("Erreur envoi email de cadeau :", error);
    }
  }

  return NextResponse.json({ ok: true });
}
