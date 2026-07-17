"use client";

import { Form } from "@/components/form";
import { H2 } from "@/components/h2";
import { TextField } from "@/components/text-field";
import { useGetEmbedding } from "@/hooks/useGetEmbedding";
import Link from "next/link";
import { useState } from "react";

export default function Garden() {
  const [input, setInput] = useState("");
  const { getEmbedding, embedding, closest, error, isPending } =
    useGetEmbedding();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 p-4">
      <H2 className="bg-background col-span-2 sm:col-span-2 xl:col-span-6 order-first sm:order-0 p-2">
        <Link href="/">STOKHASTIK</Link>{" "}
        <Link href="/garden">
          <span className="text-xs text-green-400">GARDEN</span>
        </Link>
      </H2>

      <Form onSubmit={() => getEmbedding(input)}>
        <TextField
          name="input"
          label="Text"
          type="textarea"
          value={input}
          onChange={setInput}
          required
          className="sm:max-w-104"
        />

        <button
          type="submit"
          disabled={isPending}
          className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block sm:w-50 w-full cursor-pointer text-center hover:underline"
        >
          {isPending ? "Embedding…" : "Embed"}
        </button>
      </Form>

      {error && (
        <p className="text-red-500 text-xs">
          An unknown error occurred: {error.message}
        </p>
      )}

      {closest && (
        <div className="text-xs font-mono border border-foreground p-2 w-full sm:max-w-104">
          <p className="font-bold uppercase">
            {(closest.similarity * 100).toFixed(1)}% match
          </p>
          <p>{closest.embedding.originalText}</p>
        </div>
      )}

      {embedding && (
        <pre className="text-xs font-mono border border-foreground p-2 w-full sm:max-w-104 max-h-64 overflow-auto">
          {JSON.stringify(embedding)}
        </pre>
      )}

      <Link
        href="/"
        className="text-xs uppercase block sm:w-50 w-full cursor-pointer text-center border border-foreground font-mono p-1 hover:underline"
      >
        Back
      </Link>
    </div>
  );
}
