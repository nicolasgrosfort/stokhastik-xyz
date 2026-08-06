"use client";

import { Checkbox } from "@/components/checkbox";
import { Form } from "@/components/form";
import { H3 } from "@/components/h3";
import { Model } from "@/components/model";
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
    <section className="text-foreground h-full w-full min-h-0">
      <div className="grid sm:grid-cols-2 sm:grid-rows-1 grid-rows-[minmax(160px,1fr)_auto] grid-cols-1 h-full w-full min-h-0 gap-px">
        <div className="bg-background w-full h-full min-h-0">
          <Model
            position={2.5}
            rotation={Math.PI * 0.5}
            stopRotation={true}
            model="/models/poteau-bois-temple.glb"
          />
        </div>

        <div className="bg-background w-full flex items-center justify-center">
          <div className="h-full sm:max-w-120 flex flex-col items-start justify-center p-4 gap-2 flex-1">
            <H3 className="uppercase text-left">Créer un compte</H3>

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
                        label="Prénom"
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
                        label="Nom"
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
                      label="Email"
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
                      label="Mot de passe"
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
                      className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 block w-full enabled:cursor-pointer text-center enabled:hover:underline"
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
          </div>
        </div>
      </div>
    </section>
  );
}
