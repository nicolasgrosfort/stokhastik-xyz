import { listAssetFiles } from "@/libs/assets";
import { NextResponse } from "next/server";

export async function GET() {
  const files = await listAssetFiles("models");

  return NextResponse.json({ files });
}
