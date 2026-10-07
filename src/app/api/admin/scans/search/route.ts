import { authOptions } from "@/libs/auth";
import { searchScans } from "@/libs/scan-search";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

const MAX_QUERY_LENGTH = 200;

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: "Requête trop longue." },
      { status: 400 },
    );
  }

  try {
    const results = await searchScans(query);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Erreur recherche scans :", error);

    return NextResponse.json(
      { error: "Impossible d'effectuer la recherche." },
      { status: 500 },
    );
  }
}
