import { authOptions } from "@/libs/auth";
import { runMailDiagnostics } from "@/libs/mail";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  try {
    const diagnostics = await runMailDiagnostics();

    return NextResponse.json(diagnostics);
  } catch (error) {
    console.error("Erreur diagnostic email :", error);

    return NextResponse.json(
      { error: "Impossible d'exécuter le diagnostic email." },
      { status: 500 },
    );
  }
}
