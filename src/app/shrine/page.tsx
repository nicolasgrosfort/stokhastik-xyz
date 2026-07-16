"use client";

import { H2 } from "@/components/h2";
import {
  Environment,
  FirstPersonControls,
  Html,
  Outlines,
  PositionalAudio,
  Wireframe,
} from "@react-three/drei";
import {
  Canvas,
  ThreeEvent,
  useFrame,
  useGraph,
  useLoader,
} from "@react-three/fiber";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

const SceneObject = ({
  stopRotation,
  showWireframe,
  showOutline,
  model,
  audio,
  position,
  isAudioReady,
}: {
  stopRotation?: boolean;
  showWireframe?: boolean;
  showOutline?: boolean;
  model: string;
  audio: string;
  position: Vector3;
  isAudioReady: boolean;
}) => {
  const result = useLoader(GLTFLoader, model);
  const { nodes } = useGraph(result.scene);
  const ref = useRef<THREE.Group>(null);
  const audioRef = useRef<THREE.PositionalAudio>(null);

  useEffect(() => {
    if (isAudioReady && audioRef.current) {
      audioRef.current?.play();
    }
  }, [isAudioReady]);

  useFrame((_, delta) => {
    if (ref.current && !stopRotation) {
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
      }}
    >
      {Object.entries(nodes).map(([name, node]) =>
        node instanceof THREE.Mesh ? (
          <mesh
            key={name}
            geometry={node.geometry}
            material={node.material}
            position={node.position}
            rotation={node.rotation}
            scale={node.scale}
          >
            {showWireframe && <Wireframe stroke="white" thickness={0.01} />}
            {showOutline && <Outlines thickness={2} color="white" />}
          </mesh>
        ) : null,
      )}
      <PositionalAudio ref={audioRef} url={audio} distance={0.5} loop />
    </group>
  );
};

export default function Shrine() {
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [showWireframe, setShowWireframe] = useState(true);
  const [showOutline, setShowOutline] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 p-4">
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        <button
          onClick={() => setShowWireframe((v) => !v)}
          className="font-mono text-xs uppercase px-2 py-1 border bg-background/80"
        >
          Wireframe {showWireframe ? "on" : "off"}
        </button>
        <button
          onClick={() => setShowOutline((v) => !v)}
          className="font-mono text-xs uppercase px-2 py-1 border bg-background/80"
        >
          Outline {showOutline ? "on" : "off"}
        </button>
      </div>
      <Canvas
        style={{ position: "absolute", inset: 0 }}
        camera={{
          position: [0, 2, 5], // Position initiale à hauteur d'yeux
          fov: 60,
        }}
      >
        <FirstPersonControls
          movementSpeed={2} // Vitesse de déplacement du joueur
          lookSpeed={0.1} // Vitesse de rotation de la caméra
          lookVertical={false} // Permet ou non de regarder en haut/bas
        />

        <Environment
          environmentIntensity={0.4}
          files="/hdris/monochrome-studio.hdr"
        />

        <Suspense
          fallback={
            <Html center>
              <p className="font-mono text-xs uppercase">Loading...</p>
            </Html>
          }
        >
          <SceneObject
            model="/models/tree-trunk.glb"
            audio="/audio/tree-trunk.mp3"
            position={new Vector3(-5, -1, -10)}
            isAudioReady={isAudioReady}
            showOutline={showOutline}
            showWireframe={showWireframe}
          />

          <SceneObject
            model="/models/caillou.glb"
            audio="/audio/tree-trunk.mp3"
            position={new Vector3(5, 1, -2)}
            isAudioReady={isAudioReady}
            showOutline={showOutline}
            showWireframe={showWireframe}
          />
        </Suspense>
      </Canvas>

      <H2 className="relative z-10 p-2">
        <Link href="/">STOKHASTIK</Link>{" "}
        <Link href="/shrine">
          <span className="text-xs text-blue-400">SHRINE</span>
        </Link>
      </H2>
      {!isAudioReady && (
        <button
          className="cursor-pointer z-10"
          onClick={() => setIsAudioReady(true)}
        >
          Enable Audio
        </button>
      )}
    </div>
  );
}
