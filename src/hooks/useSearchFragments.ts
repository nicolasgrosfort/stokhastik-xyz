import { cosineSimilarity } from "@/libs/similarity";
import { useMemo } from "react";
import { Fragment, useGetFragments } from "./useGetFragments";

export function useSearchFragments(embedding: number[] | null) {
  const { fragments, error, isPending, isFetching } = useGetFragments();

  const results = useMemo<Fragment[] | null>(() => {
    if (!embedding) return null;

    return fragments
      .map((fragment) => ({
        ...fragment,
        similarity: Array.isArray(fragment.data.embedding)
          ? cosineSimilarity(embedding, fragment.data.embedding as number[])
          : -1,
      }))
      .sort((a, b) => b.similarity - a.similarity);
  }, [embedding, fragments]);

  return { fragments, results, error, isPending, isFetching };
}
