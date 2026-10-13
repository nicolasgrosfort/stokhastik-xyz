"use client";

import { TagsInput } from "@/components/admin/tags-input";
import { Form } from "@/components/common/form";
import { TextField } from "@/components/common/text-field";
import type { ScanListItem } from "@/libs/scans";
import { parseModelFileName } from "@/libs/scan-file";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ScanForm({
  scan,
  tagSuggestions,
  availableFiles = [],
}: {
  // Absent : mode création, avec choix ou envoi du fichier 3D.
  scan?: ScanListItem;
  tagSuggestions: string[];
  availableFiles?: string[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState(availableFiles);
  const [file, setFile] = useState("");
  const [uploading, setUploading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: scan?.name ?? "",
      description: scan?.description ?? "",
      capturedAt: scan?.capturedAt?.toISOString().slice(0, 10) ?? "",
      location: scan?.location ?? "",
      category: scan?.category ?? "",
      tags: Array.isArray(scan?.tags)
        ? scan.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
    },
    onSubmit: async ({ value }) => {
      setError(null);

      if (!scan && !file) {
        setError("Choisis ou téléverse un fichier .glb ou .ply.");
        return;
      }

      try {
        const res = await fetch(
          scan ? `/api/admin/scans/${scan.id}` : "/api/admin/scans",
          {
            method: scan ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(scan ? value : { ...value, file }),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Une erreur s'est produite.");
          return;
        }

        router.push("/admin/scans");
        router.refresh();
      } catch {
        setError("Une erreur s'est produite.");
      }
    },
  });

  // Sélectionne un fichier du serveur et préremplit nom et date s'ils sont vides.
  const selectFile = (name: string) => {
    setFile(name);

    if (!name) return;

    const parsed = parseModelFileName(name);

    if (!form.getFieldValue("name")) form.setFieldValue("name", parsed.name);

    if (!form.getFieldValue("capturedAt") && parsed.capturedAt) {
      form.setFieldValue("capturedAt", parsed.capturedAt);
    }
  };

  // Téléverse sur le serveur, l'ajoute à la liste et le sélectionne.
  const uploadFile = async (upload: File) => {
    setError(null);
    setUploading(true);

    try {
      const body = new FormData();
      body.set("type", "models");
      body.set("file", upload);

      const res = await fetch("/api/admin/assets", { method: "POST", body });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Impossible d'envoyer le fichier.");
        return;
      }

      const uploaded = String(data.path).split("/").pop() as string;
      setFiles((current) =>
        current.includes(uploaded)
          ? current
          : [...current, uploaded].sort((a, b) => a.localeCompare(b)),
      );
      selectFile(uploaded);
    } catch {
      setError("Impossible d'envoyer le fichier.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form onSubmit={() => form.handleSubmit()}>
      <div className="flex flex-col gap-4 w-full max-w-md">
        {scan ? (
          <p className="font-mono text-xs break-all opacity-60">{scan.file}</p>
        ) : (
          <div className="flex flex-col items-start gap-2 w-full">
            <label className="flex w-full flex-col items-start gap-1">
              <span className="text-xs uppercase font-medium font-mono">
                Fichier 3D sur le serveur<sup>*</sup>
              </span>
              <select
                value={file}
                disabled={uploading}
                onChange={(event) => selectFile(event.target.value)}
                className="w-full border border-foreground bg-background font-mono text-xs p-1"
              >
                <option value="">
                  {files.length === 0
                    ? "Aucun fichier disponible"
                    : "— Choisir un fichier —"}
                </option>
                {files.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col items-start gap-1">
              <span className="text-xs uppercase font-medium font-mono">
                {uploading ? "Envoi en cours…" : "Ou téléverser (.glb, .ply)"}
              </span>
              <input
                type="file"
                accept=".glb,.ply"
                disabled={uploading}
                className="font-mono text-xs"
                onChange={(event) => {
                  const picked = event.target.files?.[0];
                  event.target.value = "";
                  if (picked) uploadFile(picked);
                }}
              />
            </label>
          </div>
        )}

        <form.Field name="name">
          {(field) => (
            <TextField
              name={field.name}
              label="Nom"
              value={field.state.value}
              onChange={field.handleChange}
              required
              autofocus={Boolean(scan)}
            />
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <TextField
              name={field.name}
              label="Description"
              type="textarea"
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </form.Field>

        <div className="flex gap-4">
          <form.Field name="capturedAt">
            {(field) => (
              <TextField
                name={field.name}
                label="Date de capture"
                type="date"
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>

          <form.Field name="location">
            {(field) => (
              <TextField
                name={field.name}
                label="Lieu"
                placeholder="Kyoto, Japon"
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>
        </div>

        <form.Field name="category">
          {(field) => (
            <TextField
              name={field.name}
              label="Catégorie"
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </form.Field>

        <form.Field name="tags">
          {(field) => (
            <TagsInput
              name={field.name}
              label="Tags"
              value={field.state.value}
              suggestions={tagSuggestions}
              onChange={field.handleChange}
            />
          )}
        </form.Field>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <button
                type="submit"
                disabled={isSubmitting || uploading}
                className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 block w-full enabled:cursor-pointer text-center enabled:hover:underline"
              >
                {isSubmitting
                  ? "Enregistrement..."
                  : scan
                    ? "Enregistrer"
                    : "Ajouter le scan"}
              </button>
            )}
          </form.Subscribe>
          <Link
            href="/admin/scans"
            className="bg-background text-foreground border border-foreground font-mono text-xs uppercase p-1 block w-full text-center hover:underline"
          >
            Retour
          </Link>
        </div>
      </div>
    </Form>
  );
}
