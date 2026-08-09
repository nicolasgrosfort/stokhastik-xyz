import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Non connecté." },
      { status: 401 },
    );
  }

  const body = await request.json();
  const newsletter = body?.newsletter === true;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { newsletter },
    select: { newsletter: true },
  });

  return NextResponse.json({
    success: true,
    data: { newsletter: user.newsletter },
  });
}
