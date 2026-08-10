"use client";

import { ErrorBoundary } from "@/components/common/error-boundary";
import { Model } from "@/components/common/model";
import Image from "next/image";
import { useEffect, useState } from "react";

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
              key={debouncedModel}
              fallback={
                <p className="absolute inset-0 flex items-center justify-center text-xs font-mono text-center p-2">
                  Modèle introuvable.
                </p>
              }
            >
              <Model
                model={debouncedModel}
                position={position}
                rotation={rotation}
                stopRotation={false}
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
