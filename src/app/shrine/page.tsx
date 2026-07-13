"use client";

import { CameraController } from "@/components/camera-controller";
import { H2 } from "@/components/h2";
import { Environment, Html } from "@react-three/drei";
import { Canvas, ThreeEvent, useLoader } from "@react-three/fiber";
import Link from "next/link";
import { Suspense, useRef, useState } from "react";
import { Group, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

const SCENE_CONFIG = {
  object: {
    position: new Vector3(-5, 0, -10),
    rotation: [0, 0, 0] as [number, number, number],
  },
  camera: {
    initialPosition: [0, 0, 5] as [number, number, number],
    focusPosition: new Vector3(-10, 2, -2),
    lookAt: new Vector3(0, 0, -10),
  },
};

const Object = ({ path, onClick }: { path: string; onClick: () => void }) => {
  const result = useLoader(GLTFLoader, path);
  const ref = useRef<Group>(null);

  return (
    <group
      ref={ref}
      position={SCENE_CONFIG.object.position}
      rotation={SCENE_CONFIG.object.rotation}
    >
      <primitive
        object={result.scene}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onClick();
        }}
      />
    </group>
  );
};

export default function Shrine() {
  const [cameraPosition, setCameraPosition] = useState<Vector3 | null>(null);
  const [cameraLookAt, setCameraLookAt] = useState<Vector3 | null>(null);

  const focusObject = () => {
    setCameraPosition(SCENE_CONFIG.camera.focusPosition.clone());
    setCameraLookAt(SCENE_CONFIG.camera.lookAt.clone());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 p-4">
      <Canvas
        style={{ position: "absolute", inset: 0 }}
        camera={{
          position: SCENE_CONFIG.camera.initialPosition,
          fov: 50,
        }}
      >
        <CameraController position={cameraPosition} lookAt={cameraLookAt} />

        <Environment environmentIntensity={0.4} preset="studio" />

        <Suspense
          fallback={
            <Html center>
              <p className="font-mono text-xs uppercase">Loading...</p>
            </Html>
          }
        >
          <Object path="/models/tree-trunk.glb" onClick={focusObject} />
        </Suspense>
      </Canvas>

      <H2 className="relative z-10 p-2">
        <Link href="/">STOKHASTIK</Link>{" "}
        <Link href="/shrine">
          <span className="text-xs text-blue-400">SHRINE</span>
        </Link>
      </H2>

      <Link
        href="/"
        className="relative z-10 text-xs uppercase block sm:w-50 w-full cursor-pointer text-center border border-foreground font-mono p-1 hover:underline"
      >
        Back
      </Link>
    </div>
  );
}
