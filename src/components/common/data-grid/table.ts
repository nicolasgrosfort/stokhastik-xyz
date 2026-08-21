"use client";

import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  createTableHook,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  tableFeatures,
  type RowData,
} from "@tanstack/react-table";

/**
 * The feature set shared by every admin data grid: sorting, a single search
 * box (global filter), and client-side pagination. Add a feature here only
 * once a grid actually needs it.
 */
export const dataGridFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    datetime: sortFn_datetime,
    basic: sortFn_basic,
  },
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  globalFilteringFeature,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

export const DEFAULT_PAGE_SIZE = 10;

export const { useAppTable, createAppColumnHelper } = createTableHook({
  features: dataGridFeatures,
  getRowId: (row: { id: string }) => row.id,
  globalFilterFn: "includesString",
});

export type DataGridInstance<TData extends RowData> = ReturnType<
  typeof useAppTable<TData>
>;
