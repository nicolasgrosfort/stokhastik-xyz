import { StoreItemForm } from "@/components/admin/store-item-form";
import { H3 } from "@/components/common/h3";
import { prisma } from "@/libs/prisma";
import { notFound } from "next/navigation";

export default async function EditStoreItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.storeItem.findUnique({ where: { id } });

  if (!item) {
    notFound();
  }

  return (
    <section className="text-foreground bg-background h-full w-full min-h-0 flex flex-col items-center gap-4 p-4 overflow-y-auto">
      <H3 className="uppercase">Modifier l&apos;item</H3>
      <StoreItemForm item={item} />
    </section>
  );
}
