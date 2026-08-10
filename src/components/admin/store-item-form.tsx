"use client";

import { StoreItemPreview } from "@/components/admin/store-item-preview";
import { Form } from "@/components/common/form";
import { TextField } from "@/components/common/text-field";
import { slugify } from "@/libs/utils";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

const today = () => new Date().toISOString().slice(0, 10);

export function StoreItemForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      model: "",
      thumbnail: "",
      price: "",
      position: "2",
      rotation: "0",
      releaseDate: today(),
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
        const res = await fetch("/api/admin/store-items", {
          method: "POST",
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
          }),
        });

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

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 block w-full enabled:cursor-pointer text-center enabled:hover:underline"
            >
              {isSubmitting ? "Création..." : "Créer l'item"}
            </button>
          )}
        </form.Subscribe>
      </div>
    </Form>
  );
}
