import { prisma } from "@/libs/prisma";
import { getStoreItemArgs } from "@/libs/store-item";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.storeItem.findMany(getStoreItemArgs);
  return NextResponse.json({ success: true, data: items });
}
