"use client";

import { H2 } from "@/components/h2";
import {
  Environment,
  FirstPersonControls,
  Html,
  PositionalAudio,
} from "@react-three/drei";
import { Canvas, ThreeEvent, useLoader } from "@react-three/fiber";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

const Object = ({
  model,
  audio,
  position,
  isAudioReady,
}: {
  model: string;
  audio: string;
  position: Vector3;
  isAudioReady: boolean;
}) => {
  const result = useLoader(GLTFLoader, model);
  const audioRef = useRef<THREE.PositionalAudio>(null);

  useEffect(() => {
    if (isAudioReady && audioRef.current) {
      audioRef.current?.play();
    }
  }, [isAudioReady]);

  return (
    <group position={position}>
      <primitive
        object={result.scene}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
        }}
      />
      <PositionalAudio ref={audioRef} url={audio} distance={0.5} loop />
    </group>
  );
};

export default function Shrine() {
  const [isAudioReady, setIsAudioReady] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 p-4">
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
          lookVertical={true} // Permet ou non de regarder en haut/bas
        />

        <Environment environmentIntensity={0.4} preset="studio" />

        <Suspense
          fallback={
            <Html center>
              <p className="font-mono text-xs uppercase">Loading...</p>
            </Html>
          }
        >
          <Object
            model="/models/tree-trunk.glb"
            audio="/audio/tree-trunk.mp3"
            position={new Vector3(-5, -1, -10)}
            isAudioReady={isAudioReady}
          />

          <Object
            model="/models/caillou.glb"
            audio="/audio/super-potato.m4a"
            position={new Vector3(5, 1, -2)}
            isAudioReady={isAudioReady}
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
