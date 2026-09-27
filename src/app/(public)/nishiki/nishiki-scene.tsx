"use client";

import {
  parseAnnotations,
  resolveAnnotationAssets,
} from "@/components/common/annotations";
import { Annotation, ModelAnnotation } from "@/components/common/model";
import { PlyModel } from "@/components/common/ply-model";
import { Scene } from "@/components/common/scene";
import { useState } from "react";

// Récupérées depuis le panneau admin de /models (bouton "Copier").
const defaultAnnotations: ModelAnnotation[] = [
  {
    text: "Korean Dog",
    point: [12.937906805620601, 0.8042247661480963, 6.171422808775111],
    labelOffset: [0.27, 0.5, 0],
  },
  {
    text: "Omikuji machine",
    point: [10.095138040616101, 1.465730895485213, 1.4120716703744294],
    labelOffset: [-0.35, 0.73, 0],
  },
  {
    text: "Shishi",
    point: [7.1047785339646055, 1.4149274596081198, 2.5526573561854162],
    labelOffset: [0.5, 0.5, 0],
  },
  {
    text: "Ema",
    point: [0.3321333239687341, 2.4760233008465846, -3.59870953066046],
    labelOffset: [0.5, 0.5, 0],
  },
];

export function NishikiScene({ model }: { model: string }) {
  const [annotations, setAnnotations] =
    useState<ModelAnnotation[]>(defaultAnnotations);
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
