import { authOptions } from "@/libs/auth";
import { sendVerificationEmail } from "@/libs/mail";
import { prisma } from "@/libs/prisma";
import { getClientIp, isRateLimited } from "@/libs/rate-limit";
import crypto from "crypto";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non connecté." }, { status: 401 });
    }

    const ip = getClientIp(request);

    if (
      isRateLimited(`resend-verification:${ip}`, {
        limit: 5,
        windowMs: 15 * 60_000,
      }) ||
      isRateLimited(`resend-verification-user:${session.user.id}`, {
        limit: 3,
        windowMs: 15 * 60_000,
      })
    ) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessaie dans quelques minutes." },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ ok: true });
    }

    if (!user.email) {
      return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60_000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiresAt: verificationTokenExpiresAt,
      },
    });

    await sendVerificationEmail({
      to: user.email,
      firstName: user.firstName ?? "",
      token: verificationToken,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erreur resend-verification :", error);

    return NextResponse.json(
      { error: "Impossible d'envoyer l'email." },
      { status: 500 },
    );
  }
}
