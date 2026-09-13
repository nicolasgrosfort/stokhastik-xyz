"use client";

import { Model } from "@/components/common/model";
import { parseAsString, useQueryState } from "nuqs";
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default function ModelViewerPage() {
  return (
    <Suspense>
      <ModelViewer />
    </Suspense>
  );
}

function ModelViewer() {
  const [file, setFile] = useQueryState("file", parseAsString.withDefault(""));
  const [position, setPosition] = useQueryState(
    "position",
    parseAsString.withDefault(""),
  );
  const [pageName, setPageName] = useQueryState(
    "pageName",
    parseAsString.withDefault(""),
  );

  const modelUrl = file
    ? `/api/assets/models/${file.endsWith(".glb") ? file : `${file}.glb`}`
    : null;

  const modelPosition = position ? parseFloat(position) : 0.5;

  useEffect(() => {
    if (pageName) {
      document.title = pageName;
    }
  }, [pageName]);

  return (
    <section className="h-screen w-screen min-h-0 flex flex-col items-center fixed top-0 left-0 right-0 bottom-0 bg-background">
      <title>{pageName}</title>
      <div className="relative w-full flex-1 min-h-0">
        {modelUrl ? (
          <ErrorBoundary
            key={modelUrl}
            fallback={
              <p className="absolute inset-0 flex items-center justify-center text-xs font-mono text-center p-2 uppercase">
                Modèle introuvable
              </p>
            }
          >
            <Model model={modelUrl} position={modelPosition} rotation={0} />
          </ErrorBoundary>
        ) : (
          <p className="absolute inset-0 flex items-center justify-center text-xs font-mono text-center p-2 uppercase">
            Ajoute ?file=nom.glb&position=0.5 à l&apos;URL.
          </p>
        )}
      </div>
    </section>
  );
}
