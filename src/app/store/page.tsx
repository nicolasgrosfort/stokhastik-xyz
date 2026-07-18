"use client";

import { Item } from "@/components/item";
import { Price } from "@/components/price";
import { useGetItems } from "@/hooks/useGetItems";

export default function StorePage() {
  const { items } = useGetItems();

  const soldItems = items?.filter((item) => item.status === "sold") ?? [];
  const availableItems =
    items?.filter((item) => item.status === "available") ?? [];

  const totalSupport =
    items?.reduce(
      (acc, item) => acc + (item.status === "sold" ? item.price : 0),
      0,
    ) ?? 0;
  const totalPrice = items?.reduce((acc, item) => acc + item.price, 0) ?? 0;

  const percentageSupport =
    totalPrice > 0 ? (totalSupport / totalPrice) * 100 : 0;

  return (
    <div className="grid grid-rows-[auto_minmax(0,1fr)_auto] h-full min-h-full">
      <div className="grid content-start gap-px bg-foreground grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 h-full">
        {items?.map((item) => (
          <article key={item.id} className="aspect-3/4 bg-background ">
            <Item item={item} />
          </article>
        ))}
      </div>
      <div className="flex-1 flex flex-col justify-center bg-background border-t border-px border-foreground p-4 gap-1">
        <p className="font-mono text-xs text-center">
          {availableItems.length} available | {soldItems.length} sold |{" "}
          {items.length} total
        </p>
        <p className="font-mono text-xs text-center">
          {percentageSupport.toFixed(2)}% | <Price price={totalSupport} />{" "}
          supported
        </p>
      </div>
    </div>
  );
}
