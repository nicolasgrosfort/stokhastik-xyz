"use client";

import { Model } from "@/components/common/model";
import { Select, Toolbar } from "@base-ui/react";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

type ModelExtension = "glb" | "ply";

export function ModelViewer() {
  const [file, setFile] = useQueryState("file", parseAsString.withDefault(""));
  const [modelFiles, setModelFiles] = useState<string[]>([]);
  const [extensionFilter, setExtensionFilter] = useState<Set<ModelExtension>>(
    new Set(["ply"]),
  );

  useEffect(() => {
    fetch("/api/assets/models")
      .then((res) => res.json())
      .then((data: { files: string[] }) => setModelFiles(data.files ?? []))
      .catch(() => setModelFiles([]));
  }, []);

  const toggleExtensionFilter = (extension: ModelExtension) => {
    setExtensionFilter((previous) => {
      const next = new Set(previous);
      if (next.has(extension)) {
        next.delete(extension);
      } else {
        next.add(extension);
      }
      return next;
    });
  };

  const filteredModelFiles =
    extensionFilter.size === 0
      ? modelFiles
      : modelFiles.filter((modelFile) =>
          extensionFilter.has(
            modelFile.split(".").pop()?.toLowerCase() as ModelExtension,
          ),
        );

  useEffect(() => {
    if (!file && filteredModelFiles.length > 0) {
      setFile(filteredModelFiles[0]);
    }
  }, [file, filteredModelFiles, setFile]);

  const [position, setPosition] = useQueryState(
    "position",
    parseAsString.withDefault("0.5"),
  );
  const [stopRotation, setStopRotation] = useQueryState(
    "stopRotation",
    parseAsString.withDefault("false"),
  );

  const [enablePan, setEnablePan] = useQueryState(
    "enablePan",
    parseAsString.withDefault("false"),
  );
  const [pointSize, setPointSize] = useQueryState(
    "pointSize",
    parseAsString.withDefault("0.01"),
  );

  const stopRotationValue = stopRotation === "true";
  const enablePanValue = enablePan === "true";
  const pointSizeValue = parseFloat(pointSize) || 0.01;

  const modelUrl = file
    ? `/api/assets/models/${/\.(glb|ply)$/i.test(file) ? file : `${file}`}`
    : null;

  const modelPosition = position ? parseFloat(position) : 0.5;

  return (
    <section className="h-dvh w-screen min-h-0 flex flex-col items-center fixed top-0 left-0 right-0 bottom-0 bg-background">
      <Toolbar.Root className="absolute top-[calc(0.5rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-10 flex max-w-[calc(100vw-1rem)] flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none border border-foreground bg-background/90 p-1 font-mono text-[10px] whitespace-nowrap uppercase sm:text-xs">
        <Toolbar.Group className="flex items-center gap-1">
          <label className="px-1 text-foreground/70">POS</label>
          <Toolbar.Input
            type="number"
            step="0.1"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-10 bg-background p-1 font-mono focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </Toolbar.Group>
        <Toolbar.Separator className="h-4 w-px bg-foreground" />
        <Toolbar.Group className="flex items-center gap-1">
          <label className="px-1 text-foreground/70">SIZE</label>
          <Toolbar.Input
            type="number"
            step="0.01"
            min="0"
            value={pointSize}
            onChange={(e) => setPointSize(e.target.value)}
            className="w-10 bg-background p-1 font-mono focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </Toolbar.Group>
        <Toolbar.Separator className="h-4 w-px bg-foreground" />
        <Toolbar.Group className="flex items-center gap-1">
          <Toolbar.Button
            aria-pressed={stopRotationValue}
            onClick={() =>
              setStopRotation(stopRotationValue ? "false" : "true")
            }
            className="cursor-pointer px-2 py-0.5 data-[pressed=true]:bg-foreground data-[pressed=true]:text-background uppercase"
            data-pressed={stopRotationValue}
          >
            Rotation
          </Toolbar.Button>
          <Toolbar.Button
            aria-pressed={enablePanValue}
            onClick={() => setEnablePan(enablePanValue ? "false" : "true")}
            className="cursor-pointer px-2 py-0.5 data-[pressed=true]:bg-foreground data-[pressed=true]:text-background uppercase"
            data-pressed={enablePanValue}
          >
            Pan
          </Toolbar.Button>
        </Toolbar.Group>
      </Toolbar.Root>
      <Toolbar.Root className="absolute bottom-[calc(0.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-10 flex max-w-[calc(100vw-1rem)] flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none border border-foreground bg-background/90 p-1 font-mono text-[10px] whitespace-nowrap uppercase sm:text-xs">
        <Toolbar.Group className="flex items-center gap-1">
          <label className="px-1 text-foreground/70">Model</label>
          <Select.Root
            value={file}
            onValueChange={(value) => setFile(value ?? "")}
            items={filteredModelFiles.map((modelFile) => ({
              label: modelFile,
              value: modelFile,
            }))}
          >
            <Toolbar.Button
              render={<Select.Trigger />}
              className="flex min-w-32 max-w-40 cursor-pointer items-center justify-between gap-2 overflow-hidden  bg-background p-1 font-mono focus:outline focus:-outline-offset-2 focus:outline-foreground"
            >
              <Select.Value placeholder="Choisir…" className="truncate" />
              <Select.Icon className="shrink-0">▾</Select.Icon>
            </Toolbar.Button>
            <Select.Portal>
              <Select.Positioner
                className="z-20 outline-none"
                side="top"
                sideOffset={4}
              >
                <Select.Popup className="max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto border border-foreground bg-background font-mono text-[10px] uppercase sm:text-xs">
                  {filteredModelFiles.map((modelFile) => (
                    <Select.Item
                      key={modelFile}
                      value={modelFile}
                      className="cursor-pointer px-2 py-1 data-highlighted:bg-foreground data-highlighted:text-background"
                    >
                      <Select.ItemText>{modelFile}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </Toolbar.Group>
        <Toolbar.Separator className="h-4 w-px bg-foreground" />
        <Toolbar.Group className="flex items-center gap-1">
          <Toolbar.Button
            aria-pressed={extensionFilter.has("glb")}
            onClick={() => toggleExtensionFilter("glb")}
            className="cursor-pointer px-2 py-0.5 data-[pressed=true]:bg-foreground data-[pressed=true]:text-background"
            data-pressed={extensionFilter.has("glb")}
          >
            GLB
          </Toolbar.Button>
          <Toolbar.Button
            aria-pressed={extensionFilter.has("ply")}
            onClick={() => toggleExtensionFilter("ply")}
            className="cursor-pointer px-2 py-0.5 data-[pressed=true]:bg-foreground data-[pressed=true]:text-background"
            data-pressed={extensionFilter.has("ply")}
          >
            PLY
          </Toolbar.Button>
        </Toolbar.Group>
      </Toolbar.Root>
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
            <Model
              model={modelUrl}
              position={modelPosition}
              rotation={0}
              stopRotation={!stopRotationValue}
              enablePan={enablePanValue}
              pointSize={pointSizeValue}
            />
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
