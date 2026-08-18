"use client";

import { Badge } from "@/components/common/badge";
import { FormatedDate } from "@/components/common/formated-date";
import { Price } from "@/components/common/price";
import { GetStoreItem } from "@/libs/store-item";
import Image from "next/image";
import Link from "next/link";

export function AdminStoreItemList({ items }: { items: GetStoreItem[] }) {
  if (items.length === 0) {
    return <p className="text-xs">Aucun item pour l&apos;instant.</p>;
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-[2.5rem_1fr_auto_auto_auto] items-center gap-4 border border-dark-green p-2 text-xs"
        >
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src={item.thumbnail}
              alt={item.name}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <span className="text-left text-ellipsis overflow-hidden whitespace-nowrap flex items-center gap-4">
            <Badge>{item.published ? "👀" : "🔒"}</Badge>
            {item.name}
          </span>
          <FormatedDate date={item.releaseDate} />
          {item.purchasedAt ? (
            <div className="flex items-center gap-2">
              <Badge>Vendu</Badge>
              {item.buyerId && (
                <span className="text-right text-ellipsis overflow-hidden whitespace-nowrap">
                  {item.buyer?.firstName}
                </span>
              )}
            </div>
          ) : (
            <Price price={item.price} />
          )}
          <Link
            href={`/admin/store-items/${item.id}/edit`}
            className="underline whitespace-nowrap"
          >
            Modifier
          </Link>
        </div>
      ))}
    </div>
  );
}
