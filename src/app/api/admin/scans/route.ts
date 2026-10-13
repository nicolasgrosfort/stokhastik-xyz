import { authOptions } from "@/libs/auth";
import {
  createScan,
  listScans,
  listScanTags,
  parseScanInput,
} from "@/libs/scans";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  const file =
    typeof body === "object" && body !== null && "file" in body
      ? body.file
      : null;

  if (typeof file !== "string" || !file) {
    return NextResponse.json(
      { error: "Aucun fichier sélectionné." },
      { status: 400 },
    );
  }

  const parsed = parseScanInput(body);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const result = await createScan(file, parsed.data);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ ok: true, scan: result.scan }, { status: 201 });
  } catch (error) {
    console.error("Erreur création scan :", error);

    return NextResponse.json(
      { error: "Impossible de créer le scan." },
      { status: 500 },
    );
  }
}
