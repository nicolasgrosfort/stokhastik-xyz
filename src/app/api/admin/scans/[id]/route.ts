import { authOptions } from "@/libs/auth";
import { getScan, parseScanInput, updateScan } from "@/libs/scans";
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
  const parsed = parseScanInput(body);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    if (!(await getScan(id))) {
      return NextResponse.json({ error: "Scan introuvable." }, { status: 404 });
    }

    const scan = await updateScan(id, parsed.data);

    return NextResponse.json({ ok: true, scan });
  } catch (error) {
    console.error("Erreur mise à jour scan :", error);

    return NextResponse.json(
      { error: "Impossible de mettre à jour le scan." },
      { status: 500 },
    );
  }
}
