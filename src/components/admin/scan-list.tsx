"use client";

import { Badge } from "@/components/common/badge";
import { DataGrid } from "@/components/common/data-grid/data-grid";
import {
  createAppColumnHelper,
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
import type { ScanListItem } from "@/libs/scans";
import Image from "next/image";

const columnHelper = createAppColumnHelper<ScanListItem>();

const tagsOf = (scan: ScanListItem): string[] =>
  Array.isArray(scan.tags)
    ? scan.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

const columns = columnHelper.columns([
  columnHelper.display({
    id: "thumbnail",
    header: "",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.thumbnail ? (
        <div className="relative w-10 h-10 shrink-0">
          <Image
            src={row.original.thumbnail}
            alt={row.original.name}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      ) : (
        <span className="block w-10 text-[0.6rem] leading-tight uppercase opacity-60">
          Pas de miniature
        </span>
      ),
  }),
  columnHelper.accessor("name", {
    header: "Nom",
    sortFn: "alphanumeric",
    cell: ({ row }) => (
      <span className="flex items-center gap-2 whitespace-nowrap text-ellipsis overflow-hidden">
        <Badge>{row.original.kind}</Badge>
        {row.original.name}
      </span>
    ),
  }),
  columnHelper.accessor("capturedAt", {
    header: "Date",
    sortFn: "datetime",
    enableGlobalFilter: false,
    cell: ({ getValue }) => {
      const date = getValue();
      return date ? <FormatedDate date={date} /> : <span>—</span>;
    },
  }),
  columnHelper.accessor("location", {
    header: "Lieu",
    sortFn: "alphanumeric",
    cell: ({ getValue }) => getValue() ?? "—",
  }),
  columnHelper.accessor((scan) => tagsOf(scan).join(" "), {
    id: "tags",
    header: "Tags",
    sortFn: "alphanumeric",
    cell: ({ row }) => (
      <span className="flex flex-wrap gap-1">
        {tagsOf(row.original).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </span>
    ),
  }),
  columnHelper.accessor("embeddingHash", {
    id: "embedding",
    header: "Embedding",
    sortFn: "basic",
    enableGlobalFilter: false,
    cell: ({ getValue }) => <Badge>{getValue() ? "Généré" : "Manquant"}</Badge>,
  }),
]);

export function AdminScanList({ scans }: { scans: ScanListItem[] }) {
  const globalFilter = useUrlAtom({
    param: "scans_q",
    defaultValue: "",
    parse: parseSearch,
    serialize: serializeSearch,
  });
  const sorting = useUrlAtom({
    param: "scans_sort",
    defaultValue: [],
    parse: parseSorting,
    serialize: serializeSorting,
  });

  const table = useAppTable({
    data: scans,
    columns,
    atoms: { globalFilter, sorting },
    initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
  });

  if (scans.length === 0) {
    return (
      <p className="text-xs">
        Aucun scan. Lance <code>yarn seed:scans</code> pour les importer.
      </p>
    );
  }

  return (
    <DataGrid
      table={table}
      emptyMessage="Aucun scan ne correspond à cette recherche."
      searchPlaceholder="Rechercher un nom, un lieu, un tag…"
    />
  );
}
