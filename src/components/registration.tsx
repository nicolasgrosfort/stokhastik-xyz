"use client";

import { stepParser } from "@/components/details";
import { Form } from "@/components/form";
import { Item } from "@/components/item";
import { TextField } from "@/components/text-field";
import { useForm } from "@tanstack/react-form";
import { useQueryState } from "nuqs";
import { useState } from "react";

const defaultValues = {
  id: "",
  firstname: "",
  lastname: "",
  email: "",
  message: "",
  honeypot: "",
};

export const Registration = ({ item }: { item: Item }) => {
  const [error, setError] = useState<string | null>(null);
  const [, setStep] = useQueryState("process", stepParser);

  const form = useForm({
    defaultValues: {
      ...defaultValues,
      item: { id: item.id, name: item.name },
    },
    onSubmit: async ({ value }) => {
      try {
        const contactApi =
          process.env.NODE_ENV === "production" ? "/api/buy.php" : "/api/buy";

        const res = await fetch(contactApi, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Unknown error");

        setStep("qr-code");
      } catch (error) {
        if (error instanceof Error) {
          setError("An unknown error occurred: " + error.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    },
  });

  return (
    <Form
      onSubmit={() => {
        form.handleSubmit();
      }}
    >
      <section className="flex gap-4 items-center sm:max-w-104 w-full">
        <form.Field name="firstname">
          {(field) => (
            <TextField
              name={field.name}
              label="Firstname"
              type="text"
              value={field.state.value}
              onChange={field.handleChange}
              required
              autofocus
            />
          )}
        </form.Field>
        <form.Field name="lastname">
          {(field) => (
            <TextField
              name={field.name}
              label="Lastname"
              type="text"
              value={field.state.value}
              onChange={field.handleChange}
              required
            />
          )}
        </form.Field>
      </section>

      <section className="flex flex-col sm:max-w-104 w-full">
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

        <form.Field name="message">
          {(field) => (
            <TextField
              name={field.name}
              label="Message"
              type="textarea"
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
      </section>

      <form.Field name="honeypot">
        {() => (
          <input
            type="text"
            name="honeypot"
            className="hidden"
            autoComplete="off"
          />
        )}
      </form.Field>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <section className="flex gap-4 w-full items-center">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block sm:w-50 w-full cursor-pointer text-center hover:underline"
            >
              {isSubmitting ? "Buying…" : "Buy"}
            </button>
          )}
        </form.Subscribe>

        <button
          onClick={() => setStep(null)}
          className=" border border-foreground font-mono text-xs uppercase p-1 block sm:w-50 w-full cursor-pointer text-center hover:underline"
        >
          Cancel
        </button>
      </section>
    </Form>
  );
};
