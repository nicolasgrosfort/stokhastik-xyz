"use client";

import { Html, ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

export const Scene = ({ children }: { children: React.ReactNode }) => {
  return (
    <Canvas>
      <ScrollControls pages={10} damping={0} infinite>
        <Suspense
          fallback={
            <Html center>
              <p className="font-mono text-xs uppercase">Chargement...</p>
            </Html>
          }
        >
          {children}
        </Suspense>
      </ScrollControls>
    </Canvas>
  );
};
