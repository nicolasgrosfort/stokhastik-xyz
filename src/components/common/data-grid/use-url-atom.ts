"use client";

import { useCreateAtom } from "@tanstack/react-store";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";

/**
 * A writable TanStack Store atom whose value round-trips through a single URL
 * search param, via nuqs (this project's existing URL-state library — see
 * `useCameraTarget`). Pass it as a table `atoms.<slice>` option: the table
 * writes into the atom directly, and the atom mirrors nuqs's setter — no
 * `state`/`onChange` glue needed on the table side.
 *
 * `parse`/`serialize` must be stable (module-scope) functions: they run on
 * every render and are effect dependencies. `serialize(defaultValue)` must
 * round-trip to `""` so nuqs clears the param instead of writing a default.
 */
export function useUrlAtom<T>({
  param,
  defaultValue,
  parse,
  serialize,
}: {
  param: string;
  defaultValue: T;
  parse: (raw: string) => T;
  serialize: (value: T) => string;
}) {
  const [raw, setRaw] = useQueryState(param, parseAsString.withDefault(""));
  const value = raw ? parse(raw) : defaultValue;

  const atom = useCreateAtom<T>(value);

  // The URL changed externally (back/forward, a shared link): reflect it
  // into the atom (and therefore into the table).
  useEffect(() => {
    if (JSON.stringify(atom.get()) !== JSON.stringify(value)) {
      atom.set(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  // The table (or anything else) writes the atom: reflect it into the URL.
  useEffect(() => {
    const subscription = atom.subscribe(() => {
      setRaw(serialize(atom.get()));
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atom, setRaw]);

  return atom;
}
