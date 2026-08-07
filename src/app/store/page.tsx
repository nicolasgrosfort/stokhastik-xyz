"use client";

import { Item } from "@/components/item";
import { Price } from "@/components/price";
import { ToggleGroup } from "@/components/toggle-group";
import { useGetItems } from "@/hooks/useGetItems";
import { tokensToCHF } from "@/libs/pack";
import { useMemo, useState } from "react";

type SortKey = "price" | "name" | "date";
type StatusFilter = "all" | "available" | "sold";

const DEFAULT_SORT_KEY: SortKey = "date";
const DEFAULT_STATUS_FILTER: StatusFilter = "all";

export default function StorePage() {
  const { items } = useGetItems();
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_SORT_KEY);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    DEFAULT_STATUS_FILTER,
  );

  const soldItems = items?.filter((item) => item.status === "sold") ?? [];
  const availableItems =
    items?.filter((item) => item.status === "available") ?? [];

  const totalSupport =
    items?.reduce(
      (acc, item) => acc + (item.status === "sold" ? item.price : 0),
      0,
    ) ?? 0;

  const displayedItems = useMemo(() => {
    const filtered =
      statusFilter === "all"
        ? (items ?? [])
        : statusFilter === "available"
          ? availableItems
          : soldItems;

    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "price":
          return a.price - b.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
        default:
          return (b.date ?? "").localeCompare(a.date ?? "");
      }
    });
  }, [items, availableItems, soldItems, statusFilter, sortKey]);

  return (
    <div className="grid grid-rows-[auto_auto_minmax(0,1fr)_auto] h-full min-h-full">
      <div className="text-foreground font-mono text-xs uppercase border-b border-px border-foreground grid grid-cols-2 sm:grid-cols-4 gap-px items-center justify-items-center bg-foreground sticky top-18 sm:top-12 z-20">
        <div className="sm:col-start-1 min-w-0 sm:col-span-2 bg-background  w-full h-full p-2">
          <ToggleGroup
            value={sortKey}
            onChange={setSortKey}
            options={[
              { value: "date", label: "date" },
              { value: "price", label: "prix" },
              { value: "name", label: "nom" },
            ]}
          />
        </div>
        <div className="sm:col-start-3 min-w-0 sm:col-span-2 bg-background w-full h-full p-2">
          <ToggleGroup
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "tous" },
              { value: "available", label: "dispos" },
              { value: "sold", label: "vendus" },
            ]}
          />
        </div>
      </div>
      <div className="grid content-start gap-px bg-foreground grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 h-full">
        {displayedItems.length > 0 ? (
          <>
            {displayedItems.map((item) => (
              <article key={item.id} className="aspect-3/4 bg-background ">
                <Item item={item} />
              </article>
            ))}

            {Array.from({
              length: (8 - (displayedItems.length % 8)) % 8,
            }).map((_, index) => (
              <div
                key={`filler-${index}`}
                className="aspect-3/4 bg-background"
              />
            ))}
          </>
        ) : (
          <p className="col-span-full text-center bg-background font-mono text-xs uppercase p-4">
            Aucun article ne correspond aux filtres sélectionnés.
          </p>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center bg-background border-t border-px border-foreground p-4 gap-1 sticky bottom-14 sm:bottom-8">
        <p className="font-mono text-xs text-center">
          {availableItems.length} disponibles | {soldItems.length} vendus |{" "}
          {items.length} total
        </p>
        <p className="font-mono text-xs text-center">
          soutien {tokensToCHF(totalSupport).toLocaleString("fr-CH")} CHF |{" "}
          <Price price={totalSupport} />{" "}
        </p>
      </div>
    </div>
  );
}
