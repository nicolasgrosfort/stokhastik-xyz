"use client";

import { StoreItemPreview } from "@/components/admin/store-item-preview";
import { Checkbox } from "@/components/common/checkbox";
import { Form } from "@/components/common/form";
import { TextField } from "@/components/common/text-field";
import { slugify } from "@/libs/utils";
import { StoreItem } from "@prisma/client";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const today = () => new Date().toISOString().slice(0, 10);

function AssetImportButton({
  type,
  accept,
  uploading,
  error,
  onFile,
}: {
  type: "models" | "thumbnails";
  accept: string;
  uploading: boolean;
  error: string | null;
  onFile: (file: File) => void;
}) {
  const inputId = `asset-import-${type}`;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="bg-background text-foreground border border-dark-green font-mono text-xs uppercase p-1 block w-fit cursor-pointer hover:underline"
      >
        {uploading ? "Import en cours..." : "Importer un fichier"}
      </label>
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

export function StoreItemForm({ item }: { item?: StoreItem }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!item);
  const [uploading, setUploading] = useState<{
    model: boolean;
    thumbnail: boolean;
  }>({ model: false, thumbnail: false });
  const [uploadError, setUploadError] = useState<{
    model: string | null;
    thumbnail: string | null;
  }>({ model: null, thumbnail: null });

  const form = useForm({
    defaultValues: {
      name: item?.name ?? "",
      slug: item?.slug ?? "",
      description: item?.description ?? "",
      model: item?.model ?? "",
      thumbnail: item?.thumbnail ?? "",
      price: item ? String(item.price) : "",
      position: item ? String(item.position) : "2",
      rotation: item ? String(item.rotation) : "0",
      releaseDate: item ? item.releaseDate.toISOString().slice(0, 10) : today(),
      published: item?.published ?? false,
    },
    onSubmit: async ({ value }) => {
      setError(null);

      const price = Number(value.price);
      const position = Number(value.position);
      const rotation = Number(value.rotation);

      if (
        !Number.isFinite(price) ||
        !Number.isFinite(position) ||
        !Number.isFinite(rotation)
      ) {
        setError("Prix, position et rotation doivent être des nombres.");
        return;
      }

      try {
        const res = await fetch(
          item ? `/api/admin/store-items/${item.id}` : "/api/admin/store-items",
          {
            method: item ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: value.name,
              slug: value.slug,
              description: value.description || undefined,
              model: value.model,
              thumbnail: value.thumbnail,
              price,
              position,
              rotation,
              releaseDate: value.releaseDate,
              published: value.published,
            }),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Une erreur s'est produite.");
          return;
        }

        router.push("/admin");
        router.refresh();
      } catch {
        setError("Une erreur s'est produite.");
      }
    },
  });

  const handleFileImport = async (
    type: "models" | "thumbnails",
    field: "model" | "thumbnail",
    file: File,
  ) => {
    setUploading((prev) => ({ ...prev, [field]: true }));
    setUploadError((prev) => ({ ...prev, [field]: null }));

    try {
      const body = new FormData();
      body.append("type", type);
      body.append("file", file);

      const res = await fetch("/api/admin/assets", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setUploadError((prev) => ({
          ...prev,
          [field]: data.error ?? "Échec de l'import.",
        }));
        return;
      }

      form.setFieldValue(field, data.path);
    } catch {
      setUploadError((prev) => ({ ...prev, [field]: "Échec de l'import." }));
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  return (
    <Form onSubmit={() => form.handleSubmit()}>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <form.Field name="name">
          {(field) => (
            <TextField
              name={field.name}
              label="Nom"
              value={field.state.value}
              onChange={(value) => {
                field.handleChange(value);
                if (!slugTouched) {
                  form.setFieldValue("slug", slugify(value));
                }
              }}
              required
              autofocus
            />
          )}
        </form.Field>

        <form.Field name="slug">
          {(field) => (
            <TextField
              name={field.name}
              label="Slug"
              description="Utilisé dans l'URL de l'item (/store/le-slug)."
              value={field.state.value}
              onChange={(value) => {
                setSlugTouched(true);
                field.handleChange(slugify(value));
              }}
              required
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

        <form.Field name="model">
          {(field) => (
            <div className="flex flex-col gap-2 w-full">
              <TextField
                name={field.name}
                label="Modèle 3D"
                placeholder="/models/mon-item.glb"
                value={field.state.value}
                onChange={field.handleChange}
                required
              />
              <AssetImportButton
                type="models"
                accept=".glb"
                uploading={uploading.model}
                error={uploadError.model}
                onFile={(file) => handleFileImport("models", "model", file)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="thumbnail">
          {(field) => (
            <div className="flex flex-col gap-2 w-full">
              <TextField
                name={field.name}
                label="Miniature"
                placeholder="/thumbnails/mon-item.png"
                value={field.state.value}
                onChange={field.handleChange}
                required
              />
              <AssetImportButton
                type="thumbnails"
                accept=".avif"
                uploading={uploading.thumbnail}
                error={uploadError.thumbnail}
                onFile={(file) =>
                  handleFileImport("thumbnails", "thumbnail", file)
                }
              />
            </div>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [
            state.values.thumbnail,
            state.values.model,
            state.values.position,
            state.values.rotation,
          ]}
        >
          {([thumbnail, model, position, rotation]) => (
            <StoreItemPreview
              thumbnail={thumbnail}
              model={model}
              position={Number(position) || 0}
              rotation={Number(rotation) || 0}
            />
          )}
        </form.Subscribe>

        <div className="flex gap-4">
          <form.Field name="price">
            {(field) => (
              <TextField
                name={field.name}
                label="Prix (STKH)"
                type="number"
                value={field.state.value}
                onChange={field.handleChange}
                required
              />
            )}
          </form.Field>

          <form.Field name="releaseDate">
            {(field) => (
              <TextField
                name={field.name}
                label="Date de sortie"
                type="date"
                value={field.state.value}
                onChange={field.handleChange}
                required
              />
            )}
          </form.Field>
        </div>

        <div className="flex gap-4">
          <form.Field name="position">
            {(field) => (
              <TextField
                name={field.name}
                label="Position caméra"
                type="number"
                value={field.state.value}
                onChange={field.handleChange}
                required
              />
            )}
          </form.Field>

          <form.Field name="rotation">
            {(field) => (
              <TextField
                name={field.name}
                label="Rotation (radians)"
                type="number"
                value={field.state.value}
                onChange={field.handleChange}
                required
              />
            )}
          </form.Field>
        </div>

        <form.Field name="published">
          {(field) => (
            <Checkbox
              name={field.name}
              label="Visible dans le store"
              checked={field.state.value}
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
                {item
                  ? isSubmitting
                    ? "Enregistrement..."
                    : "Enregistrer"
                  : isSubmitting
                    ? "Création..."
                    : "Créer l'item"}
              </button>
            )}
          </form.Subscribe>
          <Link
            href="/admin"
            className="bg-background text-foreground border border-foreground font-mono text-xs uppercase p-1 block w-full enabled:cursor-pointer text-center enabled:hover:underline"
          >
            Retour
          </Link>
        </div>
      </div>
    </Form>
  );
}
