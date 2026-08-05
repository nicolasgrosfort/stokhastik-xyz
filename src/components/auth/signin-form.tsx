"use client";

import { Form } from "@/components/form";
import { H1 } from "@/components/h1";
import { TextField } from "@/components/text-field";
import { useForm } from "@tanstack/react-form";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        const res = await signIn("email", {
          email: value.email,
          redirect: false,
          callbackUrl,
        });

        if (res?.error) {
          setError("Un erreur s'est produite. Vérifie ton adresse email.");
          return;
        }

        setSent(true);
      } catch {
        setError("Un erreur s'est produite.");
      }
    },
  });

  if (sent) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 h-full p-4 text-center bg-background">
        <H1>Vérifie tes emails</H1>
        <p className="font-mono text-sm">
          Un lien de connexion vient de t&apos;être envoyé.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 h-full p-4 bg-background">
      <H1>Connexion</H1>

      <Form
        onSubmit={() => {
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-4 sm:max-w-104 w-full">
          <form.Field name="email">
            {(field) => (
              <TextField
                name={field.name}
                label="Email*"
                type="email"
                value={field.state.value}
                onChange={field.handleChange}
                required
                autofocus
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
                {isSubmitting ? "Envoi..." : "Recevoir le lien de connexion"}
              </button>
            )}
          </form.Subscribe>
        </div>
      </Form>
    </section>
  );
}
