import { authOptions } from "@/libs/auth";
import { listScans, listScanTags } from "@/libs/scans";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  try {
    const [scans, tags] = await Promise.all([listScans(), listScanTags()]);

    return NextResponse.json({ scans, tags });
  } catch (error) {
    console.error("Erreur lecture scans :", error);

    return NextResponse.json(
      { error: "Impossible de charger les scans." },
      { status: 500 },
    );
  }
}
