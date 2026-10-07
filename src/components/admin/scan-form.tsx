"use client";

import { TagsInput } from "@/components/admin/tags-input";
import { Form } from "@/components/common/form";
import { TextField } from "@/components/common/text-field";
import type { ScanListItem } from "@/libs/scans";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ScanForm({
  scan,
  tagSuggestions,
}: {
  scan: ScanListItem;
  tagSuggestions: string[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: scan.name,
      description: scan.description ?? "",
      capturedAt: scan.capturedAt?.toISOString().slice(0, 10) ?? "",
      location: scan.location ?? "",
      category: scan.category ?? "",
      tags: Array.isArray(scan.tags)
        ? scan.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        const res = await fetch(`/api/admin/scans/${scan.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

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

  return (
    <Form onSubmit={() => form.handleSubmit()}>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <p className="font-mono text-xs break-all opacity-60">{scan.file}</p>

        <form.Field name="name">
          {(field) => (
            <TextField
              name={field.name}
              label="Nom"
              value={field.state.value}
              onChange={field.handleChange}
              required
              autofocus
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
                disabled={isSubmitting}
                className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 block w-full enabled:cursor-pointer text-center enabled:hover:underline"
              >
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
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
