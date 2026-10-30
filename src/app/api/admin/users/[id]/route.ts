import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { parseUserInput } from "@/libs/user";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const { id } = await params;
  const body: unknown = await request.json();
  const parsed = parseUserInput(body);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (id === session.user.id && parsed.data.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Tu ne peux pas retirer ton propre rôle d'administrateur." },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Utilisateur introuvable." },
        { status: 404 },
      );
    }

    const emailTaken = await prisma.user.findFirst({
      where: { email: parsed.data.email, NOT: { id } },
    });

    if (emailTaken) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé par un autre utilisateur." },
        { status: 409 },
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...parsed.data,
        name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("Erreur mise à jour utilisateur :", error);

    return NextResponse.json(
      { error: "Impossible de mettre à jour l'utilisateur." },
      { status: 500 },
    );
  }
}
