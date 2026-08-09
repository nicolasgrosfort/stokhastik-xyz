import { sendVerificationEmail } from "@/libs/mail";
import { prisma } from "@/libs/prisma";
import { getClientIp, isRateLimited } from "@/libs/rate-limit";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const GENERIC_MESSAGE =
  "Si cet email n'est pas déjà utilisé, tu vas recevoir un email de confirmation.";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    if (isRateLimited(`register:${ip}`, { limit: 5, windowMs: 15 * 60_000 })) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessaie dans quelques minutes." },
        { status: 429 },
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("email" in body) ||
      !("password" in body) ||
      !("firstName" in body) ||
      !("lastName" in body) ||
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      typeof body.firstName !== "string" ||
      typeof body.lastName !== "string" ||
      !body.email ||
      !body.password ||
      !body.firstName ||
      !body.lastName
    ) {
      return NextResponse.json(
        { error: "Merci de remplir tous les champs." },
        { status: 400 },
      );
    }

    const { email, password, firstName, lastName } = body;
    const newsletter = "newsletter" in body && body.newsletter === true;

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser?.emailVerified) {
      return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60_000);

    const data = {
      email,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      password: hashedPassword,
      newsletter,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: verificationTokenExpiresAt,
    };

    // Compte existant mais jamais vérifié : on le "réclame" (nouveau mot de
    // passe + nouveau token) plutôt que de bloquer, pour permettre au vrai
    // propriétaire de l'email de reprendre la main sur un compte squatté.
    if (existingUser) {
      await prisma.user.update({ where: { id: existingUser.id }, data });
    } else {
      await prisma.user.create({ data });
    }

    try {
      await sendVerificationEmail({
        to: email,
        firstName,
        token: verificationToken,
      });
    } catch (error) {
      console.error("Erreur envoi email de vérification :", error);
    }

    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("Erreur register :", error);

    return NextResponse.json(
      { error: "Impossible de créer le compte." },
      { status: 500 },
    );
  }
}
