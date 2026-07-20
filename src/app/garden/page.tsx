"use client";

import { Form } from "@/components/form";
import { H2 } from "@/components/h2";
import { TextField } from "@/components/text-field";
import { useGetEmbedding } from "@/hooks/useGetEmbedding";
import { useSearchFragments } from "@/hooks/useSearchFragments";
import Link from "next/link";
import { useState } from "react";

export default function Garden() {
  const [input, setInput] = useState("");
  const { getEmbedding, embedding, error, isPending } = useGetEmbedding();

  const { results } = useSearchFragments(embedding);
  const closest = results?.[0] ?? null;

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
          placeholder="What are you looking for?"
          value={input}
          onChange={setInput}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              getEmbedding(input);
            }
          }}
          required
          className="sm:max-w-104"
        />
        <div className="flex gap-2">
          {" "}
          <button
            type="submit"
            disabled={isPending}
            className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block sm:w-50 w-full cursor-pointer text-center hover:underline"
          >
            {isPending ? "Searching..." : "Search"}
          </button>
          <Link
            href="/"
            className="text-xs uppercase block sm:w-50 w-full cursor-pointer text-center border border-foreground font-mono p-1 hover:underline"
          >
            Back
          </Link>
        </div>
      </Form>

      {error && (
        <p className="text-red-500 text-xs">
          An unknown error occurred: {error.message}
        </p>
      )}

      {embedding && (
        <pre className="text-xs font-mono border border-foreground p-2 w-full sm:max-w-104 max-h-64 overflow-auto">
          {JSON.stringify(embedding)}
        </pre>
      )}

      {closest && (
        <div className="text-xs font-mono border border-foreground p-2 w-full sm:max-w-104">
          <p className="font-bold uppercase">
            {(closest.similarity * 100).toFixed(1)}% match
          </p>
          <p className="font-bold">{closest.fragment.name}</p>
          <p>{closest.fragment.data.citation}</p>
        </div>
      )}
    </div>
  );
}
