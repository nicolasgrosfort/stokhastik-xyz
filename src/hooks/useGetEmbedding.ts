import { embeddings } from "@/data/embeddings";
import { findClosestEmbedding } from "@/libs/similarity";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

type EmbeddingResponse = {
  data: { embedding: number[] }[];
};

type ErrorResponse = {
  success: false;
  error: string;
};

async function fetchEmbedding(input: string): Promise<EmbeddingResponse> {
  const embeddingApi =
    process.env.NODE_ENV === "production"
      ? "/api/embedding.php"
      : "/api/embedding";

  const response = await fetch(embeddingApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error((data as ErrorResponse).error ?? "Unknown error");

  return data;
}

export function useGetEmbedding() {
  const { mutate, mutateAsync, data, error, isPending } = useMutation({
    mutationFn: fetchEmbedding,
  });

  const embedding = data?.data[0]?.embedding ?? null;

  const closest = useMemo(
    () => (embedding ? findClosestEmbedding(embedding, embeddings) : null),
    [embedding],
  );

  return {
    getEmbedding: mutate,
    getEmbeddingAsync: mutateAsync,
    embedding,
    closest,
    error,
    isPending,
  };
}
