import { authOptions } from "@/libs/auth";
import { isAssetType, saveAssetFile, validateAssetFile } from "@/libs/assets";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const formData = await request.formData();
  const type = formData.get("type");
  const file = formData.get("file");

  if (!isAssetType(type)) {
    return NextResponse.json({ error: "Type de fichier invalide." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
  }

  const validation = validateAssetFile(type, file);

  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const path = await saveAssetFile(type, file, validation.extension);
    return NextResponse.json({ ok: true, path });
  } catch (error) {
    console.error("Erreur upload asset :", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer le fichier." },
      { status: 500 },
    );
  }
}
