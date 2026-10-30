"use client";

import { Checkbox } from "@/components/common/checkbox";
import { Form } from "@/components/common/form";
import { TextField } from "@/components/common/text-field";
import { Role } from "@prisma/client";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UserFormUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: Role;
  newsletter: boolean;
};

export function UserForm({
  user,
  isSelf,
}: {
  user: UserFormUser;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      admin: user.role === "ADMIN",
      newsletter: user.newsletter,
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: value.firstName,
            lastName: value.lastName,
            email: value.email,
            role: value.admin ? "ADMIN" : "USER",
            newsletter: value.newsletter,
          }),
        });

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

  return (
    <Form onSubmit={() => form.handleSubmit()}>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <div className="flex gap-4">
          <form.Field name="firstName">
            {(field) => (
              <TextField
                name={field.name}
                label="Prénom"
                value={field.state.value}
                onChange={field.handleChange}
                required
              />
            )}
          </form.Field>

          <form.Field name="lastName">
            {(field) => (
              <TextField
                name={field.name}
                label="Nom"
                value={field.state.value}
                onChange={field.handleChange}
                required
              />
            )}
          </form.Field>
        </div>

        <form.Field name="email">
          {(field) => (
            <TextField
              name={field.name}
              label="Email"
              type="email"
              value={field.state.value}
              onChange={field.handleChange}
              required
            />
          )}
        </form.Field>

        <form.Field name="admin">
          {(field) => (
            <Checkbox
              name={field.name}
              label={
                isSelf
                  ? "Administrateur (non modifiable sur ton propre compte)"
                  : "Administrateur"
              }
              checked={field.state.value}
              onChange={isSelf ? () => {} : field.handleChange}
            />
          )}
        </form.Field>

        <form.Field name="newsletter">
          {(field) => (
            <Checkbox
              name={field.name}
              label="Inscrit à la newsletter"
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
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            )}
          </form.Subscribe>
          <Link
            href="/admin"
            className="bg-background text-foreground border border-foreground font-mono text-xs uppercase p-1 block w-full text-center hover:underline"
          >
            Retour
          </Link>
        </div>
      </div>
    </Form>
  );
}
