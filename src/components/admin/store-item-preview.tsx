"use client";

import { Model } from "@/components/common/model";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}

export function StoreItemPreview({
  thumbnail,
  model,
  position,
  rotation,
}: {
  thumbnail: string;
  model: string;
  position: number;
  rotation: number;
}) {
  const debouncedThumbnail = useDebouncedValue(thumbnail, 400);
  const debouncedModel = useDebouncedValue(model, 400);
  const debouncedPosition = useDebouncedValue(position, 400);

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase">Miniature</p>
        <div className="relative w-full aspect-square border border-dark-green bg-background">
          {debouncedThumbnail ? (
            <Image
              key={debouncedThumbnail}
              src={debouncedThumbnail}
              alt="Aperçu miniature"
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <p className="absolute inset-0 flex items-center justify-center text-xs font-mono">
              —
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase">Modèle 3D</p>
        <div className="relative w-full aspect-square border border-dark-green bg-background">
          {debouncedModel ? (
            <ErrorBoundary
              resetKeys={[debouncedModel]}
              fallback={
                <p className="absolute inset-0 flex items-center justify-center text-xs font-mono text-center p-2">
                  Modèle introuvable.
                </p>
              }
            >
              {/* react-three-fiber only applies the Canvas `camera` prop once,
              on mount, so a position change needs a remount to take effect —
              rotation doesn't, it's a regular per-render group prop. */}
              <Model
                key={debouncedPosition}
                model={debouncedModel}
                position={debouncedPosition}
                rotation={rotation}
                stopRotation={true}
              />
            </ErrorBoundary>
          ) : (
            <p className="absolute inset-0 flex items-center justify-center text-xs font-mono">
              —
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
