import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Non connecté." },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tokens: true },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Utilisateur introuvable." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: { tokens: user.tokens } });
}
