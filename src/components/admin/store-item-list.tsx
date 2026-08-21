"use client";

import { Badge } from "@/components/common/badge";
import { DataGrid } from "@/components/common/data-grid/data-grid";
import {
  createAppColumnHelper,
  DEFAULT_PAGE_SIZE,
  useAppTable,
} from "@/components/common/data-grid/table";
import {
  parseSearch,
  parseSorting,
  serializeSearch,
  serializeSorting,
} from "@/components/common/data-grid/url-codecs";
import { useUrlAtom } from "@/components/common/data-grid/use-url-atom";
import { FormatedDate } from "@/components/common/formated-date";
import { Price } from "@/components/common/price";
import { GetStoreItem } from "@/libs/store-item";
import Image from "next/image";
import Link from "next/link";

const columnHelper = createAppColumnHelper<GetStoreItem>();

const columns = columnHelper.columns([
  columnHelper.display({
    id: "thumbnail",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="relative w-10 h-10 shrink-0">
        <Image
          src={row.original.thumbnail}
          alt={row.original.name}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    ),
  }),
  columnHelper.accessor("name", {
    header: "Nom",
    sortFn: "alphanumeric",
    cell: ({ row }) => (
      <span className="flex items-center gap-2 whitespace-nowrap text-ellipsis overflow-hidden">
        <Badge>{row.original.published ? "👀" : "🔒"}</Badge>
        {row.original.name}
      </span>
    ),
  }),
  columnHelper.accessor("releaseDate", {
    header: "Date",
    sortFn: "datetime",
    enableGlobalFilter: false,
    cell: ({ getValue }) => <FormatedDate date={getValue()} />,
  }),
  columnHelper.accessor("price", {
    header: "Prix",
    sortFn: "basic",
    enableGlobalFilter: false,
    cell: ({ row }) =>
      row.original.purchasedAt ? (
        <div className="flex items-center gap-2">
          <Badge>Vendu</Badge>
          {row.original.buyerId && (
            <span className="whitespace-nowrap text-ellipsis overflow-hidden">
              {row.original.buyer?.firstName}
            </span>
          )}
        </div>
      ) : (
        <Price price={row.original.price} />
      ),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`/admin/store-items/${row.original.id}/edit`}
        className="underline whitespace-nowrap"
      >
        Modifier
      </Link>
    ),
  }),
]);

export function AdminStoreItemList({ items }: { items: GetStoreItem[] }) {
  const globalFilter = useUrlAtom({
    param: "items_q",
    defaultValue: "",
    parse: parseSearch,
    serialize: serializeSearch,
  });
  const sorting = useUrlAtom({
    param: "items_sort",
    defaultValue: [],
    parse: parseSorting,
    serialize: serializeSorting,
  });

  const table = useAppTable({
    data: items,
    columns,
    atoms: { globalFilter, sorting },
    initialState: { pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE } },
  });

  if (items.length === 0) {
    return <p className="text-xs">Aucun item pour l&apos;instant.</p>;
  }

  return (
    <DataGrid
      table={table}
      emptyMessage="Aucun item ne correspond à cette recherche."
      searchPlaceholder="Rechercher un item…"
    />
  );
}
