"use client";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ScanSearchResult } from "@/libs/scan-search";
import { Popover, Toolbar } from "@base-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

async function fetchResults(
  query: string,
  signal: AbortSignal,
): Promise<ScanSearchResult[]> {
  const res = await fetch(
    `/api/admin/scans/search?q=${encodeURIComponent(query)}`,
    {
      signal,
    },
  );
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error ?? "Recherche impossible.");

  return data.results as ScanSearchResult[];
}

/**
 * Recherche sémantique en direct : le scan le plus proche est chargé dès que
 * les résultats arrivent, les suivants restent cliquables.
 */
export function ScanSearch({
  currentFile,
  onSelect,
}: {
  currentFile: string;
  onSelect: (file: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const enabled = debouncedQuery.length >= MIN_QUERY_LENGTH;

  const { data, isFetching, error } = useQuery({
    queryKey: ["scan-search", debouncedQuery],
    queryFn: ({ signal }) => fetchResults(debouncedQuery, signal),
    enabled,
    staleTime: 60_000,
  });

  const bestFile = enabled ? data?.[0]?.file : undefined;

  // Charge automatiquement le meilleur résultat, une fois par nouvelle requête.
  useEffect(() => {
    if (bestFile) onSelect(bestFile);
    // onSelect est volontairement exclu : seul un nouveau meilleur résultat compte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bestFile, debouncedQuery]);

  const waiting = query.trim() !== debouncedQuery || isFetching;

  return (
    <Toolbar.Group className="flex items-center gap-1">
      <Toolbar.Input
        ref={setInput}
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => event.stopPropagation()}
        placeholder="Rechercher un scan…"
        aria-label="Rechercher un scan"
        className="w-40 bg-background p-1 font-mono uppercase focus:outline focus:-outline-offset-2 focus:outline-foreground sm:w-56"
      />

      <Popover.Root
        open={open && enabled}
        onOpenChange={(next, details) => {
          // Cliquer dans le champ ne doit pas fermer la liste.
          if (!next && details.event?.target === input) return;
          setOpen(next);
        }}
      >
        <Popover.Portal>
          <Popover.Positioner
            anchor={input}
            side="top"
            align="start"
            sideOffset={4}
            className="z-20 outline-none"
          >
            <Popover.Popup
              initialFocus={false}
              finalFocus={false}
              className="max-h-(--available-height) w-72 max-w-[calc(100vw-1rem)] overflow-y-auto border border-foreground bg-background font-mono text-[10px] uppercase sm:text-xs"
            >
              <ul className="flex flex-col">
                {error ? (
                  <li className="p-2 text-red-500 normal-case">
                    {error.message}
                  </li>
                ) : data && data.length > 0 ? (
                  data.map((result, index) => (
                    <li key={result.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(result.file);
                          setOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between gap-2 px-2 py-1 text-left hover:bg-foreground hover:text-background ${
                          result.file === currentFile ? "bg-foreground/20" : ""
                        }`}
                      >
                        <span className="truncate">
                          {index === 0 ? "▸ " : ""}
                          {result.name}
                        </span>
                        <span className="shrink-0 opacity-60">
                          {result.score.toFixed(2)}
                        </span>
                      </button>
                    </li>
                  ))
                ) : waiting ? (
                  <li className="p-2 opacity-60">Recherche…</li>
                ) : (
                  <li className="p-2 opacity-60">Aucun résultat pertinent</li>
                )}
              </ul>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </Toolbar.Group>
  );
}
