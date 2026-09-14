"use client";

import { GetStoreItem } from "@/libs/store-item";
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import Image from "next/image";
import { Suspense, useRef, useState } from "react";
import { Group } from "three";
import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";

const dracoLoader = new DRACOLoader();

const Object = ({
  stopRotation,
  model,
  rotation,
}: {
  model: string;
  rotation: GetStoreItem["rotation"];
  stopRotation?: boolean;
}) => {
  const result = useLoader(GLTFLoader, model, (loader) => {
    loader.setDRACOLoader(dracoLoader);
  });
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ref.current && !stopRotation) {
      ref.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={ref} rotation={[0, rotation, 0]}>
      <primitive object={result.scene} />
    </group>
  );
};

export const Model = ({
  position,
  rotation,
  model,
  thumbnail,
  stopRotation,
}: {
  position: GetStoreItem["position"];
  rotation: GetStoreItem["rotation"];
  model: GetStoreItem["model"];
  thumbnail?: GetStoreItem["thumbnail"];
  stopRotation?: boolean;
}) => {
  const [isControlling, setIsControlling] = useState(false);

  if (!model) {
    if (!thumbnail) return null;

    return (
      <div className="relative w-full h-full min-h-0">
        <Image src={thumbnail} alt="" fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-0">
      <Canvas
        className="cursor-move"
        style={{ position: "absolute", inset: 0 }}
        camera={{ position: [position, position, position], fov: 50 }}
      >
        <ambientLight intensity={2} />
        <Suspense
          fallback={
            <Html center>
              <p className="font-mono text-xs uppercase">Chargement...</p>
            </Html>
          }
        >
          <Object
            model={model}
            rotation={rotation}
            stopRotation={stopRotation || isControlling}
          />
        </Suspense>
        <OrbitControls
          enablePan={false}
          onStart={() => setIsControlling(true)}
          onEnd={() => setIsControlling(false)}
        />
      </Canvas>
    </div>
  );
};
