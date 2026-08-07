import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.storeItem.findMany({
    orderBy: { releaseDate: "desc" },
    include: { buyer: { select: { firstName: true } } },
  });

  const data = items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? undefined,
    model: item.model,
    thumbnail: item.thumbnail,
    price: item.price,
    position: item.position,
    rotation: item.rotation,
    date: item.releaseDate.toISOString().slice(0, 10),
    status: item.purchasedAt ? "sold" : "available",
    buyBy: item.buyer?.firstName ?? "",
    buyAt: item.purchasedAt ? item.purchasedAt.toISOString().slice(0, 10) : "",
  }));

  return NextResponse.json({ success: true, data });
}
