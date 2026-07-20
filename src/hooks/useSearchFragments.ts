import { cosineSimilarity } from "@/libs/similarity";
import { useMemo } from "react";
import { Fragment, useGetFragments } from "./useGetFragments";

export type ScoredFragment = { fragment: Fragment; similarity: number };

export function useSearchFragments(embedding: number[] | null) {
  const { fragments, error, isPending, isFetching } = useGetFragments();

  const results = useMemo<ScoredFragment[] | null>(() => {
    if (!embedding) return null;

    return fragments
      .filter((fragment) => Array.isArray(fragment.data.embedding))
      .map((fragment) => ({
        fragment,
        similarity: cosineSimilarity(
          embedding,
          fragment.data.embedding as number[],
        ),
      }))
      .sort((a, b) => b.similarity - a.similarity);
  }, [embedding, fragments]);

  console.log("useSearchFragments results:", results);

  return { fragments, results, error, isPending, isFetching };
}
