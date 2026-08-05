import { Prisma } from "@/generated/prisma/client";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        error: "Tu dois être connecté pour acheter un article.",
      },
      { status: 401 },
    );
  }

  const { id } = await params;

  try {
    const item = await prisma.$transaction(async (tx) => {
      const existing = await tx.storeItem.findUnique({ where: { id } });

      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      if (existing.purchasedAt) {
        throw new Error("SOLD_OUT");
      }

      const claim = await tx.storeItem.updateMany({
        where: { id, purchasedAt: null },
        data: { buyerId: session.user.id, purchasedAt: new Date() },
      });

      if (claim.count === 0) {
        throw new Error("SOLD_OUT");
      }

      const debit = await tx.user.updateMany({
        where: { id: session.user.id, tokens: { gte: existing.price } },
        data: { tokens: { decrement: existing.price } },
      });

      if (debit.count === 0) {
        throw new Error("INSUFFICIENT_TOKENS");
      }

      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: "SPEND",
          tokens: -existing.price,
          storeItemId: existing.id,
          description: existing.name,
        },
      });

      return tx.storeItem.findUniqueOrThrow({ where: { id } });
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    const isWriteConflict =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2034" ||
        error.code === "P2028" ||
        /record has changed since last read/i.test(error.message));

    if (isWriteConflict) {
      return NextResponse.json(
        { success: false, error: "Cet article vient d'être vendu." },
        { status: 409 },
      );
    }

    if (message === "NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Article introuvable." },
        { status: 404 },
      );
    }

    if (message === "SOLD_OUT") {
      return NextResponse.json(
        { success: false, error: "Cet article vient d'être vendu." },
        { status: 409 },
      );
    }

    if (message === "INSUFFICIENT_TOKENS") {
      return NextResponse.json(
        { success: false, error: "Solde insuffisant." },
        { status: 400 },
      );
    }

    console.error("Erreur achat store item :", error);
    return NextResponse.json(
      { success: false, error: "Impossible de finaliser l'achat." },
      { status: 500 },
    );
  }
}
