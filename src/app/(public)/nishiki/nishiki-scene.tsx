"use client";

import {
  parseAnnotations,
  resolveAnnotationAssets,
} from "@/components/common/annotations";
import { Annotation, ModelAnnotation } from "@/components/common/model";
import { PlyModel } from "@/components/common/ply-model";
import { Scene } from "@/components/common/scene";
import { useState } from "react";

export function NishikiScene({ model }: { model: string }) {
  const [annotations, setAnnotations] = useState<ModelAnnotation[]>([]);
  const [pasteFailed, setPasteFailed] = useState(false);

  const pasteAnnotations = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = parseAnnotations(text ? JSON.parse(text) : []);
      setAnnotations(parsed ?? []);
      setPasteFailed(parsed === null);
    } catch {
      setAnnotations([]);
      setPasteFailed(true);
    }
  };

  return (
    <div className="relative h-full w-full">
      <Scene>
        <PlyModel model={model} />
        {resolveAnnotationAssets(annotations).map((annotation, index) => (
          <Annotation key={index} {...annotation} />
        ))}
      </Scene>
      <button
        type="button"
        onClick={pasteAnnotations}
        className="absolute right-2 top-[calc(0.5rem+env(safe-area-inset-top))] z-10 cursor-pointer border border-foreground bg-background/60 px-2 py-1 font-mono text-[10px] uppercase shadow-md backdrop-blur-sm sm:text-xs"
      >
        {pasteFailed ? "Presse-papier invalide" : "Coller les annotations"}
      </button>
    </div>
  );
}
