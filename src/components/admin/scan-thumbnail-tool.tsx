"use client";

import { GltfObject, isPly, PlyObject } from "@/components/common/model";
import { Bounds, Center, OrbitControls, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

const buttonClass =
  "bg-background text-foreground border border-foreground font-mono text-xs uppercase p-1 enabled:cursor-pointer enabled:hover:underline disabled:opacity-40";

// Hors du Canvas : un <Html> de drei dans un fallback Suspense crée un second
// root React qui se démonte pendant le rendu.
function LoadingOverlay() {
  const { active, progress } = useProgress();

  if (!active) return null;

  return (
    <p className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-1 font-mono text-xs uppercase">
      Chargement… {Math.round(progress)} %
    </p>
  );
}

export function ScanThumbnailTool({
  scanId,
  file,
  name,
  thumbnail,
}: {
  scanId: string;
  file: string;
  name: string;
  thumbnail: string | null;
}) {
  const router = useRouter();
  const modelUrl = `/api/assets/models/${file}`;
  const ply = isPly(file);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [pointSize, setPointSize] = useState(0.01);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  const capture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);
    setMessage(null);

    canvas.toBlob(async (blob) => {
      try {
        if (!blob) throw new Error("Capture impossible.");

        const body = new FormData();
        body.append("file", blob, "thumbnail.png");

        const res = await fetch(`/api/admin/scans/${scanId}/thumbnail`, {
          method: "POST",
          body,
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok)
          throw new Error(data.error ?? "Échec de l'enregistrement.");

        setMessage({ text: "Miniature enregistrée.", error: false });
        router.refresh();
      } catch (e) {
        setMessage({
          text: e instanceof Error ? e.message : "Une erreur s'est produite.",
          error: true,
        });
      } finally {
        setSaving(false);
      }
    }, "image/png");
  };

  return (
    <div className="flex w-full flex-wrap items-start gap-4">
      <div className="flex w-72 max-w-full flex-col gap-2">
        <div className="relative aspect-square w-72 max-w-full border border-dark-green bg-background">
          <ErrorBoundary
            resetKeys={[modelUrl]}
            fallback={
              <p className="absolute inset-0 flex items-center justify-center bg-background p-2 text-center font-mono text-xs">
                Modèle introuvable.
              </p>
            }
          >
            <Canvas
              key={resetKey}
              gl={{ preserveDrawingBuffer: true, alpha: true }}
              dpr={2}
              camera={{ position: [1, 1, 1], fov: 50 }}
              style={{ position: "absolute", inset: 0 }}
              onCreated={({ gl }) => {
                canvasRef.current = gl.domElement;
              }}
            >
              <ambientLight intensity={2} />
              <Suspense fallback={null}>
                <Bounds fit observe margin={1.2}>
                  <Center>
                    {ply ? (
                      <PlyObject model={modelUrl} pointSize={pointSize} />
                    ) : (
                      <GltfObject model={modelUrl} />
                    )}
                  </Center>
                </Bounds>
              </Suspense>
              <OrbitControls makeDefault enableDamping />
            </Canvas>
          </ErrorBoundary>
          <LoadingOverlay />
        </div>
        <p className="font-mono text-[10px] uppercase opacity-60">
          Le carré ci-dessus est exactement ce qui sera capturé. Fond
          transparent : tu vois ici le fond du site.
        </p>
      </div>

      <div className="flex w-56 max-w-full flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs uppercase">Miniature actuelle</p>
          <div className="relative aspect-square w-28 border border-dark-green bg-background">
            {thumbnail ? (
              <Image
                key={thumbnail}
                src={thumbnail}
                alt={`Miniature de ${name}`}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <p className="absolute inset-0 flex items-center justify-center bg-background p-2 text-center font-mono text-xs uppercase opacity-60">
                Pas de miniature
              </p>
            )}
          </div>
        </div>

        {ply && (
          <label className="flex flex-col gap-1 font-mono text-xs uppercase">
            Taille des points ({pointSize.toFixed(3)})
            <input
              type="range"
              min={0.001}
              max={0.05}
              step={0.001}
              value={pointSize}
              onChange={(event) => setPointSize(Number(event.target.value))}
            />
          </label>
        )}

        <button
          type="button"
          className={buttonClass}
          onClick={() => setResetKey((key) => key + 1)}
        >
          Recadrer la vue
        </button>
        <button
          type="button"
          disabled={saving}
          className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 enabled:cursor-pointer enabled:hover:underline disabled:opacity-40"
          onClick={capture}
        >
          {saving ? "Enregistrement…" : "Définir comme miniature"}
        </button>
        {message && (
          <p
            className={`font-mono text-xs ${message.error ? "text-red-500" : ""}`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
