import { Details } from "@/components/details";
import { Model } from "@/components/model";
import { items } from "@/data/items";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ item: string }>;
}) {
  const itemId = (await params).item;
  const item = items.find((i) => i.id === itemId);

  if (!item) {
    notFound();
  }

  return (
    <div className="bg-background text-foreground p-2 h-full w-full min-h-0">
      <div className="grid sm:grid-cols-2 sm:grid-rows-1 grid-rows-[minmax(0,1fr)_auto] grid-cols-1 h-full w-full min-h-0">
        <div className="w-full h-full min-h-0">
          <Model item={item} />
        </div>
        <div className="h-full w-full flex flex-col items-start justify-center p-2 gap-2 flex-1">
          <Suspense fallback={null}>
            <Details item={item} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return items.map((item) => ({ item: item.id.toString() }));
}
