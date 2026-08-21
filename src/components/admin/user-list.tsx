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
import { formatSwissNumber } from "@/libs/utils";
import { GetUser } from "@/libs/user";

const roleLabels = {
  USER: "Utilisateur",
  ADMIN: "Admin",
};

function getUserLabel(user: GetUser) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.email || "—";
}

const columnHelper = createAppColumnHelper<GetUser>();

const columns = columnHelper.columns([
  columnHelper.accessor((user) => getUserLabel(user), {
    id: "name",
    header: "Nom",
    sortFn: "alphanumeric",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-ellipsis overflow-hidden">
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    sortFn: "alphanumeric",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-ellipsis overflow-hidden">
        {getValue() ?? "—"}
      </span>
    ),
  }),
  columnHelper.accessor("role", {
    header: "Rôle",
    sortFn: "alphanumeric",
    cell: ({ getValue }) => <Badge>{roleLabels[getValue()]}</Badge>,
  }),
  columnHelper.accessor("tokens", {
    header: "STKH",
    sortFn: "basic",
    enableGlobalFilter: false,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">
        {formatSwissNumber(getValue())} STKH
      </span>
    ),
  }),
  columnHelper.accessor("newsletter", {
    header: "Newsletter",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ getValue }) => <Badge>{getValue() ? "📰" : "🚫"}</Badge>,
  }),
  columnHelper.accessor("createdAt", {
    header: "Inscrit le",
    sortFn: "datetime",
    enableGlobalFilter: false,
    cell: ({ getValue }) => <FormatedDate date={getValue()} />,
  }),
]);

export function AdminUserList({ users }: { users: GetUser[] }) {
  const globalFilter = useUrlAtom({
    param: "users_q",
    defaultValue: "",
    parse: parseSearch,
    serialize: serializeSearch,
  });
  const sorting = useUrlAtom({
    param: "users_sort",
    defaultValue: [],
    parse: parseSorting,
    serialize: serializeSorting,
  });

  const table = useAppTable({
    data: users,
    columns,
    atoms: { globalFilter, sorting },
    initialState: { pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE } },
  });

  if (users.length === 0) {
    return <p className="text-xs">Aucun utilisateur pour l&apos;instant.</p>;
  }

  return (
    <DataGrid
      table={table}
      emptyMessage="Aucun utilisateur ne correspond à cette recherche."
      searchPlaceholder="Rechercher un utilisateur…"
    />
  );
}
