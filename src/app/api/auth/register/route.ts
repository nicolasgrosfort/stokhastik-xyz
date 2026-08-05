import { sendWelcomeEmail } from "@/libs/mail";
import { prisma } from "@/libs/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
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

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        password: hashedPassword,
      },
    });

    try {
      await sendWelcomeEmail({ to: email, firstName });
    } catch (error) {
      console.error("Erreur envoi email de bienvenue :", error);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erreur register :", error);

    return NextResponse.json(
      { error: "Impossible de créer le compte." },
      { status: 500 },
    );
  }
}
