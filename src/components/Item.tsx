"use client";

import QRCode from "@/components/QRCode";
import { Environment, Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import type { Group } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export type Item = {
  name: string;
  model: string;
  price: number;
  position: [number, number, number];
};

export const BLANK_ITEM: Item = {
  name: "SOON",
  model: "",
  price: 0,
  position: [0, 0, 0],
};

const Model = ({ item }: { item: Item }) => {
  const result = useLoader(GLTFLoader, item.model);
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.1;
    }
  });

  return <primitive ref={ref} object={result.scene} />;
};

export const Item = ({ item }: { item: Item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWanted, setIsWanted] = useState(false);

  const handleClickToggleWanted = () => {
    setIsWanted((prev) => !prev);
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full relative "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isWanted ? (
        <QRCode />
      ) : (
        <>
          <Canvas
            className="w-full h-full"
            camera={{ position: item.position, fov: 50 }}
          >
            <directionalLight position={[5, 5, 5]} intensity={1.5} />
            <Environment preset="forest" />
            {item.model ? (
              <Suspense
                fallback={
                  <Html center>
                    <p className="font-mono text-xs uppercase">Loading...</p>
                  </Html>
                }
              >
                <Model item={item} />
              </Suspense>
            ) : null}
            <OrbitControls />
          </Canvas>
        </>
      )}
      <div className="w-full h-6 flex items-center justify-between absolute bottom-2 px-2">
        {isHovered ? (
          <button
            className="bg-black text-white font-mono text-xs uppercase p-1 block w-full cursor-pointer"
            onClick={handleClickToggleWanted}
          >
            {isWanted ? "Actually, no..." : "I want it!"}
          </button>
        ) : (
          <>
            <p className="font-mono text-xs uppercase">{item.name}</p>
            {item.price > 0 && (
              <p className="font-mono text-xs uppercase">
                CHF {item.price.toFixed(2)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
