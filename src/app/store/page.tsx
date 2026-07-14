"use client";
import { Item } from "@/components/item";
import { items } from "@/data/items";
import { useGetItems } from "@/hooks/useGetItems";

export default function StorePage() {
  const { data } = useGetItems();
  return (
    <div className="grid grid-rows-[auto_minmax(0,1fr)_auto] h-full min-h-full">
      <div className="grid content-start gap-px bg-foreground grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 h-full">
        {data?.map((item) => (
          <article key={item.id} className="aspect-3/4 bg-background ">
            <Item item={item} />
          </article>
        ))}
      </div>
      <div className="flex-1 bg-background border-t border-px border-foreground p-4">
        <p className="font-mono text-xs text-center">{items.length} items</p>
      </div>
    </div>
  );
}
