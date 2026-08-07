import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SortKey = "price" | "name" | "date";
export type StatusFilter = "all" | "available" | "sold";

type StoreFiltersState = {
  sortKey: SortKey;
  statusFilter: StatusFilter;
  setSortKey: (sortKey: SortKey) => void;
  setStatusFilter: (statusFilter: StatusFilter) => void;
};

export const useStoreFilters = create<StoreFiltersState>()(
  persist(
    (set) => ({
      sortKey: "date",
      statusFilter: "all",
      setSortKey: (sortKey) => set({ sortKey }),
      setStatusFilter: (statusFilter) => set({ statusFilter }),
    }),
    {
      name: "store-filters",
    },
  ),
);
