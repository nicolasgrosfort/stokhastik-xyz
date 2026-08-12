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

export function StoreItemForm({ item }: { item?: StoreItem }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!item);

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
      notifyNewsletter: false,
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
              notifyNewsletter: value.notifyNewsletter,
            }),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Une erreur s'est produite.");
          return;
        }

        router.push(`/store/${data.item.slug}`);
        router.refresh();
      } catch {
        setError("Une erreur s'est produite.");
      }
    },
  });

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
            <TextField
              name={field.name}
              label="Modèle 3D"
              placeholder="/models/mon-item.glb"
              value={field.state.value}
              onChange={field.handleChange}
              required
            />
          )}
        </form.Field>

        <form.Field name="thumbnail">
          {(field) => (
            <TextField
              name={field.name}
              label="Miniature"
              placeholder="/thumbnails/mon-item.png"
              value={field.state.value}
              onChange={field.handleChange}
              required
            />
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

        <form.Field name="notifyNewsletter">
          {(field) => (
            <Checkbox
              name={field.name}
              label={
                item
                  ? "Notifier les abonnés à la newsletter de cette modification"
                  : "Notifier les abonnés à la newsletter de ce nouvel item"
              }
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
