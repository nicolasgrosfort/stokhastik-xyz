"use client";

import { Form } from "@/components/form";
import { H2 } from "@/components/h2";
import { H3 } from "@/components/h3";
import { TextField } from "@/components/text-field";
import { useGetEmbedding } from "@/hooks/useGetEmbedding";
import type { Fragment } from "@/hooks/useGetFragments";
import { useGetFragments } from "@/hooks/useGetFragments";
import { useSearchFragments } from "@/hooks/useSearchFragments";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useState } from "react";

function reorderByProgress<T>(array: T[], progress: number) {
  if (array.length === 0) return [];

  const clamped = Math.min(Math.max(progress, 0), 1);
  const startIndex = Math.round(clamped * (array.length - 1));

  return [...array.slice(startIndex), ...array.slice(0, startIndex)];
}

export default function Garden() {
  const [input, setInput] = useState("");
  const { getEmbedding, embedding, error, isPending } = useGetEmbedding();
  const { fragments } = useGetFragments();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [filters, setFilters] = useState({
    type: [] as string[],
    thematique: [] as string[],
  });

  const { results } = useSearchFragments(embedding);

  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    setScrollProgress(current);
  });

  const computedFragments = results || fragments;
  const filteredResults = computedFragments?.filter((fragment) => {
    const typeMatch =
      filters.type.length === 0 ||
      (fragment.data.type &&
        fragment.data.type.some((type) => filters.type.includes(type)));

    const thematiqueMatch =
      filters.thematique.length === 0 ||
      (fragment.data.thématique &&
        fragment.data.thématique.some((thematique) =>
          filters.thematique.includes(thematique),
        ));

    return typeMatch && thematiqueMatch;
  });

  return (
    <div className="bg-background text-foreground p-2 h-full flex justify-center items-center">
      <motion.div className="min-h-screen  h-[200vh] relative">
        <div className="w-screen h-screen flex flex-col items-center justify-center sticky top-0">
          <div className="w-full sm:max-w-126 flex flex-col items-center justify-center gap-2 p-4">
            <H2 className="bg-background col-span-2 sm:col-span-2 xl:col-span-6 order-first sm:order-0 p-2">
              <Link className="uppercase" href="/">
                Stokhastik
              </Link>{" "}
              <Link href="/garden">
                <span className="text-xs text-green-400">GARDEN</span>
              </Link>
            </H2>

            <Form onSubmit={() => getEmbedding(input)}>
              <TextField
                name="input"
                placeholder="Que recherchez-vous ?"
                value={input}
                onChange={setInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    getEmbedding(input);
                  }
                }}
                required
                className=""
              />
              <div className="flex gap-2 w-full">
                {" "}
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline"
                >
                  {isPending ? "Recherche en cours..." : "Rechercher"}
                </button>
                <Link
                  href="/"
                  className="text-xs uppercase block  w-full cursor-pointer text-center border border-foreground font-mono p-1 hover:underline"
                >
                  Retour
                </Link>
              </div>
            </Form>

            <H3 className="text-xs uppercase">Filtres</H3>
            <div className="grid grid-cols-3 gap-2 w-full">
              <button
                className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline"
                style={{
                  backgroundColor: filters.type.includes("livre")
                    ? "var(--foreground)"
                    : "transparent",
                  color: filters.type.includes("livre")
                    ? "var(--background)"
                    : "var(--foreground)",
                }}
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    type: prev.type.includes("livre")
                      ? prev.type.filter((t) => t !== "livre")
                      : [...prev.type, "livre"],
                  }));
                }}
              >
                Livre
              </button>
              <button
                className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline"
                style={{
                  backgroundColor: filters.type.includes("journal")
                    ? "var(--foreground)"
                    : "transparent",
                  color: filters.type.includes("journal")
                    ? "var(--background)"
                    : "var(--foreground)",
                }}
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    type: prev.type.includes("journal")
                      ? prev.type.filter((t) => t !== "journal")
                      : [...prev.type, "journal"],
                  }));
                }}
              >
                Journal
              </button>
              <button
                className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:underline"
                style={{
                  backgroundColor: filters.type.includes("entretien")
                    ? "var(--foreground)"
                    : "transparent",
                  color: filters.type.includes("entretien")
                    ? "var(--background)"
                    : "var(--foreground)",
                }}
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    type: prev.type.includes("entretien")
                      ? prev.type.filter((t) => t !== "entretien")
                      : [...prev.type, "entretien"],
                  }));
                }}
              >
                Entretien
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-xs">
                Un erreur s'est produite: {error.message}
              </p>
            )}

            {embedding && (
              <pre className="text-xs font-mono border border-foreground p-2 w-full max-h-64 overflow-auto">
                {JSON.stringify(embedding)}
              </pre>
            )}

            <Fragments
              fragments={filteredResults}
              scrollProgress={scrollProgress}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const Fragments = ({
  fragments,
  scrollProgress,
}: {
  fragments: Fragment[];
  scrollProgress: number;
}) => {
  const TRANSLATE_FACTOR = 4;
  return (
    <div className="w-full relative h-full">
      {reorderByProgress(fragments, scrollProgress).map((fragment, index) => (
        <div
          className="absolute top-0 left-0 w-full h-fit shadow-lg"
          key={index}
          style={{
            left: `${index * TRANSLATE_FACTOR}px`,
            zIndex: fragments.length - index,
            top: `${index * TRANSLATE_FACTOR}px`,
          }}
        >
          <Fragment fragment={fragment} />
        </div>
      ))}
    </div>
  );
};

const Fragment = ({ fragment }: { fragment: Fragment }) => {
  return (
    <div className="flex flex-col gap-1 font-mono border border-foreground p-2 w-full bg-background">
      <p className="font-bold text-sm">{fragment.data?.titre}</p>
      <p className="text-foreground text-xs">{fragment.data?.citation}</p>
      <p className="text-foreground text-xs">{fragment.data?.analyse}</p>
      <hr className="my-2 border-foreground" />
      <p className="text-xs uppercase flex gap-2">
        <span>{(fragment.similarity * 100).toFixed(1)}% match</span>
        <span> | </span>
        <span>{fragment.data?.type?.join(", ")}</span>
        <span> | </span>
        <span>{fragment.data?.thématique?.join(", ") || "-"}</span>
      </p>
    </div>
  );
};
