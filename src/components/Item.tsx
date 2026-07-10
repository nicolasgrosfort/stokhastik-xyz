"use client";

import QRCode from "@/components/QRCode";
import { Environment, Html, PresentationControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import type { Group } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export type Item = {
  name: string;
  model: string;
  position: number;
  rotation: number;
  price: number;
  description?: string;
  status: "available" | "booked" | "sold" | "coming-soon";
};

export const BLANK_ITEM: Item = {
  name: "SOON",
  model: "",
  price: 0,
  position: 0,
  rotation: 0,
  description: "",
  status: "coming-soon",
};

const Model = ({
  item,
  stopRotation,
}: {
  item: Item;
  stopRotation?: boolean;
}) => {
  const result = useLoader(GLTFLoader, item.model);
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ref.current && !stopRotation) {
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <primitive
      ref={ref}
      object={result.scene}
      rotation={[0, item.rotation, 0]}
    />
  );
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
            camera={{ position: [0, 0, item.position], fov: 50 }}
          >
            <Environment preset="city" />
            {item.model ? (
              <Suspense
                fallback={
                  <Html center>
                    <p className="font-mono text-xs uppercase">Loading...</p>
                  </Html>
                }
              >
                <PresentationControls
                  enabled
                  global
                  snap
                  polar={[-Math.PI / 2, Math.PI / 2]}
                >
                  <Model item={item} stopRotation={isHovered} />
                </PresentationControls>
              </Suspense>
            ) : null}
          </Canvas>
        </>
      )}
      <div className="w-full h-6 flex items-center justify-between absolute bottom-2 px-2">
        {isWanted && <BuyButton />}
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

export const BuyButton = () => {
  const handleBuy = async () => {
    const contactApi =
      process.env.NODE_ENV === "production" ? "/api/buy.php" : "/api/buy";
    const res = await fetch(contactApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "123",
        firstname: "Nicolas",
        lastname: "Grosfort",
        email: "grosfort.nicols@gmail.com",
        message: "Hello, I would like to buy this item.",
        honeypot: "",
      }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    console.log("Message sent successfully");
  };

  return <button onClick={handleBuy}>Buy</button>;
};
