import { useMutation } from "@tanstack/react-query";

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

  return {
    getEmbedding: mutate,
    getEmbeddingAsync: mutateAsync,
    embedding: data?.data[0]?.embedding ?? null,
    error,
    isPending,
  };
}
