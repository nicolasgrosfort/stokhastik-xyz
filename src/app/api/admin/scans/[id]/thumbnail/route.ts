import { authOptions } from "@/libs/auth";
import { getScan } from "@/libs/scans";
import {
  MAX_THUMBNAIL_UPLOAD_BYTES,
  setScanThumbnail,
} from "@/libs/scan-thumbnail";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const { id } = await params;
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Aucune image fournie." },
      { status: 400 },
    );
  }

  if (file.type !== "image/png" || file.size > MAX_THUMBNAIL_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image PNG requise (15 Mo max)." },
      { status: 400 },
    );
  }

  try {
    const scan = await getScan(id);

    if (!scan) {
      return NextResponse.json({ error: "Scan introuvable." }, { status: 404 });
    }

    const thumbnail = await setScanThumbnail(
      scan,
      Buffer.from(await file.arrayBuffer()),
    );

    return NextResponse.json({ ok: true, thumbnail });
  } catch (error) {
    console.error("Erreur enregistrement miniature :", error);

    return NextResponse.json(
      { error: "Impossible d'enregistrer la miniature." },
      { status: 500 },
    );
  }
}
