"use client";

import { Price } from "@/components/common/price";
import { Scramble } from "@/components/common/scramble";
import { ToggleGroup } from "@/components/common/toggle-group";
import { Item } from "@/components/store/item";
import { useGetItems } from "@/hooks/useGetItems";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { tokensToCHF } from "@/libs/pack";
import { formatSwissNumber } from "@/libs/utils";
import { useMemo } from "react";

export default function StorePage() {
  const { items, isPending } = useGetItems();
  const { sortKey, statusFilter, setSortKey, setStatusFilter } =
    useStoreFilters();

  const soldItems = useMemo(
    () => items?.filter((item) => item.buyerId) ?? [],
    [items],
  );
  const availableItems = useMemo(
    () => items?.filter((item) => !item.buyerId) ?? [],
    [items],
  );

  const totalSupport =
    items?.reduce((acc, item) => acc + (item.buyerId ? item.price : 0), 0) ?? 0;

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
          return (b.releaseDate ?? "")
            .toString()
            .localeCompare((a.releaseDate ?? "").toString());
      }
    });
  }, [items, availableItems, soldItems, statusFilter, sortKey]);

  if (isPending) {
    return (
      <div className="w-full h-full text-center bg-background font-mono text-xs uppercase p-4 flex items-center justify-center">
        <Scramble playOnMount playOnFocus playOnHover playRandomly>
          Chargement...
        </Scramble>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_auto_minmax(0,1fr)] min-h-full shrink-0">
      <div className="text-foreground font-mono text-xs uppercase border-b border-px border-foreground grid grid-cols-2 sm:grid-cols-4 gap-px items-center justify-items-center bg-foreground sticky top-0 z-10">
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
      <div
        className={`grid gap-px bg-foreground grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 ${
          displayedItems.length > 0 ? "content-start" : "h-full min-h-full"
        }`}
      >
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
          <div className="col-span-full h-full flex flex-col items-center justify-center text-center bg-background font-mono text-xs p-4">
            <Scramble playOnMount playOnFocus playOnHover>
              Aucun article n'est disponible.
            </Scramble>
            {sortKey !== "date" || statusFilter !== "all" ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setSortKey("date");
                  }}
                  className="text-xs underline cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center bg-background border-t border-px border-foreground p-2 h-full gap-1 sticky bottom-0">
        <p className="font-mono text-xs text-center">
          {availableItems.length} disponibles | {soldItems.length} vendus |{" "}
          {items.length} total
        </p>
        <p className="font-mono text-xs text-center">
          soutien {formatSwissNumber(tokensToCHF(totalSupport))} CHF |{" "}
          <Price price={totalSupport} />{" "}
        </p>
      </div>
    </div>
  );
}
