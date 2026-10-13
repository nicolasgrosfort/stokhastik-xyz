import { authOptions } from "@/libs/auth";
import { validateAssetFile } from "@/libs/assets";
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

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!formData || !(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Aucun fichier fourni." },
      { status: 400 },
    );
  }

  const validation = validateAssetFile("models", file);

  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  let tags: unknown;

  try {
    tags = JSON.parse(String(formData.get("tags") ?? "[]"));
  } catch {
    return NextResponse.json({ error: "Tags invalides." }, { status: 400 });
  }

  const parsed = parseScanInput({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    location: formData.get("location"),
    capturedAt: formData.get("capturedAt"),
    tags,
  });

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const scan = await createScan(file, validation.extension, parsed.data);

    return NextResponse.json({ ok: true, scan }, { status: 201 });
  } catch (error) {
    console.error("Erreur création scan :", error);

    return NextResponse.json(
      { error: "Impossible de créer le scan." },
      { status: 500 },
    );
  }
}
