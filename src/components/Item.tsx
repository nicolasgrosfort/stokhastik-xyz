"use client";

import QRCode from "@/components/QRCode";
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import type { Group } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export type Item = {
  name: string;
  model: string;
  price: number;
};

export const BLANK_ITEM: Item = {
  name: "SOON",
  model: "",
  price: 0,
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

  const handleClickWanted = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsWanted(true);
  };

  const handleClickToggleWanted = () => {
    setIsWanted((prev) => !prev);
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClickToggleWanted}
    >
      {isWanted ? (
        <QRCode />
      ) : (
        <>
          <Canvas
            className="w-full h-full"
            camera={{ position: [-0.25, 0.25, 0.25] }}
          >
            <ambientLight intensity={2} />
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
            onClick={handleClickWanted}
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
