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
import type { EmbeddingStatus } from "@/libs/embeddings";
import type { ScanListItem } from "@/libs/scans";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const columnHelper = createAppColumnHelper<ScanListItem>();

const EMBEDDING_LABELS: Record<EmbeddingStatus, string> = {
  fresh: "À jour",
  stale: "Obsolète",
  missing: "Manquant",
};

const BATCH_SIZE = 50;

const buttonClass =
  "bg-background text-foreground border border-foreground font-mono text-xs uppercase p-1 enabled:cursor-pointer enabled:hover:underline disabled:opacity-40";

type GenerateResult = {
  updated: number;
  failed: { id: string; error: string }[];
};

async function requestEmbeddings(ids: string[]): Promise<GenerateResult> {
  const res = await fetch("/api/admin/scans/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok && !data.failed) {
    throw new Error(data.error ?? "Une erreur s'est produite.");
  }

  return data as GenerateResult;
}

function GenerateButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={loading}
        className="underline whitespace-nowrap disabled:opacity-40"
        onClick={async () => {
          setLoading(true);
          setError(null);

          try {
            const result = await requestEmbeddings([id]);
            if (result.failed.length > 0) setError(result.failed[0].error);
            else router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur.");
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Génération…" : "Générer"}
      </button>
      {error && <span className="text-red-500 text-[0.6rem]">{error}</span>}
    </span>
  );
}

function EmbeddingToolbar({ scans }: { scans: ScanListItem[] }) {
  const router = useRouter();
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const pendingIds = scans
    .filter((scan) => scan.embeddingStatus !== "fresh")
    .map((scan) => scan.id);

  const run = async (ids: string[]) => {
    setMessage(null);
    setProgress({ done: 0, total: ids.length });
    let updated = 0;
    const errors: string[] = [];

    try {
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const chunk = ids.slice(i, i + BATCH_SIZE);
        const result = await requestEmbeddings(chunk);
        updated += result.updated;
        errors.push(...new Set(result.failed.map((f) => f.error)));
        setProgress({
          done: Math.min(i + BATCH_SIZE, ids.length),
          total: ids.length,
        });
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Erreur.");
    }

    setProgress(null);
    setMessage(
      errors.length > 0
        ? `${updated} générés, erreurs : ${errors.join(" · ")}`
        : `${updated} embedding(s) généré(s).`,
    );
    router.refresh();
  };

  const running = progress !== null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={running || pendingIds.length === 0}
        className={buttonClass}
        onClick={() => run(pendingIds)}
      >
        Générer les manquants / obsolètes ({pendingIds.length})
      </button>
      <button
        type="button"
        disabled={running}
        className={buttonClass}
        onClick={() => {
          if (
            window.confirm(
              `Régénérer les embeddings des ${scans.length} scans ? Cela appelle l'API pour chacun.`,
            )
          ) {
            run(scans.map((scan) => scan.id));
          }
        }}
      >
        Tout régénérer
      </button>
      {progress && (
        <span className="font-mono text-xs">
          {progress.done} / {progress.total}
        </span>
      )}
      {message && <span className="font-mono text-xs">{message}</span>}
    </div>
  );
}

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
  columnHelper.accessor("embeddingStatus", {
    header: "Embedding",
    sortFn: "alphanumeric",
    enableGlobalFilter: false,
    cell: ({ getValue }) => <Badge>{EMBEDDING_LABELS[getValue()]}</Badge>,
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="flex items-center gap-3">
        <Link
          href={`/admin/scans/${row.original.id}/edit`}
          className="underline whitespace-nowrap"
        >
          Modifier
        </Link>
        <Link
          href={`/admin/scans/${row.original.id}/thumbnail`}
          className="underline whitespace-nowrap"
        >
          Miniature
        </Link>
        <GenerateButton id={row.original.id} />
      </span>
    ),
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
    <div className="w-full flex flex-col gap-3">
      <EmbeddingToolbar scans={scans} />
      <DataGrid
        table={table}
        emptyMessage="Aucun scan ne correspond à cette recherche."
        searchPlaceholder="Rechercher un nom, un lieu, un tag…"
      />
    </div>
  );
}
