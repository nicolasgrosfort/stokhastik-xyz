import type { SortingState } from "@tanstack/react-table";

/**
 * URL codecs for the state slices worth sharing/bookmarking on an admin grid:
 * the search query and the current sort. Pagination position stays
 * internally owned by the table (each list passes its own
 * `initialState.pagination`) — it isn't something the product needs a
 * shareable link for.
 */

export function parseSearch(raw: string): string {
  return raw;
}

export function serializeSearch(value: string): string {
  return value;
}

/** Single-column sort encoded as `field` (asc) or `-field` (desc). */
export function parseSorting(raw: string): SortingState {
  if (!raw) return [];
  const desc = raw.startsWith("-");
  return [{ id: desc ? raw.slice(1) : raw, desc }];
}

export function serializeSorting(sorting: SortingState): string {
  const [first] = sorting;
  if (!first) return "";
  return `${first.desc ? "-" : ""}${first.id}`;
}
