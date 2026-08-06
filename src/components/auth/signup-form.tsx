"use client";

import { Checkbox } from "@/components/checkbox";
import { Form } from "@/components/form";
import { H1 } from "@/components/h1";
import { TextField } from "@/components/text-field";
import { useForm } from "@tanstack/react-form";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      newsletter: true,
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Un erreur s'est produite.");
          return;
        }

        const signInRes = await signIn("credentials", {
          email: value.email,
          password: value.password,
          redirect: false,
          callbackUrl,
        });

        if (signInRes?.error) {
          setError("Compte créé, mais la connexion automatique a échoué.");
          return;
        }

        router.push(callbackUrl);
      } catch {
        setError("Un erreur s'est produite.");
      }
    },
  });

  return (
    <section className="flex flex-col items-center justify-center gap-4 h-full p-4 bg-background">
      <H1>Créer un compte</H1>

      <Form
        onSubmit={() => {
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-4 sm:max-w-104 w-full">
          <div className="flex gap-4">
            <form.Field name="firstName">
              {(field) => (
                <TextField
                  name={field.name}
                  label="Prénom*"
                  type="text"
                  value={field.state.value}
                  onChange={field.handleChange}
                  required
                  autofocus
                />
              )}
            </form.Field>

            <form.Field name="lastName">
              {(field) => (
                <TextField
                  name={field.name}
                  label="Nom*"
                  type="text"
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
                label="Email*"
                type="email"
                value={field.state.value}
                onChange={field.handleChange}
                required
              />
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <TextField
                name={field.name}
                label="Mot de passe*"
                type="password"
                value={field.state.value}
                onChange={field.handleChange}
                required
                minLength={8}
              />
            )}
          </form.Field>

          <form.Field name="newsletter">
            {(field) => (
              <Checkbox
                name={field.name}
                label="Être informé des nouveautés"
                checked={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline"
              >
                {isSubmitting ? "Création..." : "Créer mon compte"}
              </button>
            )}
          </form.Subscribe>

          <p className="text-xs font-mono text-center">
            Déjà un compte ?{" "}
            <Link href="/auth/signin" className="underline">
              Se connecter
            </Link>
          </p>
        </div>
      </Form>
    </section>
  );
}
