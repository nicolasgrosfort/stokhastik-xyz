"use client";

import type { Header, RowData } from "@tanstack/react-table";
import type {
  DataGridInstance,
  dataGridFeatures,
} from "@/components/common/data-grid/table";

/**
 * Semantic, headless-driven renderer shared by every admin list. It only
 * knows how to lay out a `table` instance — sorting, search, and pagination
 * plumbing all live in the table hook; this component just reads state and
 * calls the matching table APIs.
 */
export function DataGrid<TData extends RowData>({
  table,
  emptyMessage,
  searchPlaceholder,
}: {
  table: DataGridInstance<TData>;
  emptyMessage: string;
  searchPlaceholder?: string;
}) {
  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-2 w-full">
      <DataGridSearch table={table} placeholder={searchPlaceholder} />

      {rows.length === 0 ? (
        <p className="text-xs">{emptyMessage}</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-2 font-bold uppercase">
                      {header.isPlaceholder ? null : (
                        <DataGridHeaderCell table={table} header={header} />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-dark-green">
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id} className="p-2 align-middle">
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {table.getPageCount() > 1 && <DataGridPagination table={table} />}
    </div>
  );
}

function DataGridHeaderCell<TData extends RowData>({
  table,
  header,
}: {
  table: DataGridInstance<TData>;
  header: Header<typeof dataGridFeatures, TData, unknown>;
}) {
  if (!header.column.getCanSort()) {
    return <table.FlexRender header={header} />;
  }

  const sortDirection = header.column.getIsSorted();

  return (
    <button
      type="button"
      onClick={header.column.getToggleSortingHandler()}
      aria-sort={
        sortDirection === "asc"
          ? "ascending"
          : sortDirection === "desc"
            ? "descending"
            : "none"
      }
      className="flex items-center gap-1 uppercase whitespace-nowrap"
    >
      <table.FlexRender header={header} />
      <span aria-hidden className="text-[0.6rem]">
        {sortDirection === "asc" ? "↑" : sortDirection === "desc" ? "↓" : ""}
      </span>
    </button>
  );
}

function DataGridSearch<TData extends RowData>({
  table,
  placeholder,
}: {
  table: DataGridInstance<TData>;
  placeholder?: string;
}) {
  const globalFilter = (table.state.globalFilter as string) ?? "";

  return (
    <input
      type="search"
      value={globalFilter}
      onChange={(event) => table.setGlobalFilter(event.target.value)}
      placeholder={placeholder ?? "Rechercher…"}
      className="border border-dark-green bg-background text-foreground font-mono text-xs uppercase p-1.5 w-full max-w-xs focus:outline focus:-outline-offset-2 focus:outline-foreground"
    />
  );
}

function DataGridPagination<TData extends RowData>({
  table,
}: {
  table: DataGridInstance<TData>;
}) {
  const { pageIndex } = table.state.pagination;

  return (
    <div className="flex items-center justify-between gap-4 text-xs uppercase p-2">
      <button
        type="button"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="underline disabled:no-underline disabled:opacity-40"
      >
        Précédent
      </button>
      <span>
        Page {pageIndex + 1} / {table.getPageCount()}
      </span>
      <button
        type="button"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="underline disabled:no-underline disabled:opacity-40"
      >
        Suivant
      </button>
    </div>
  );
}
