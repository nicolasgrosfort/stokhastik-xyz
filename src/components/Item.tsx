"use client";

import QRCode from "@/components/QRCode";
import { Environment, Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { Suspense, useRef, useState } from "react";
import type { Group } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export type Item = {
  id?: string;
  name: string;
  model: string;
  position: number;
  rotation: number;
  price: number;
  description?: string;
  status: "available" | "booked" | "sold" | "coming-soon";
};

export const BLANK_ITEM: Item = {
  name: "",
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
            className="w-full h-full cursor-move"
            camera={{ position: [0, 0, item.position], fov: 50 }}
            style={{
              background: isHovered ? "rgba(0, 0, 0, 0.1)" : "transparent",
            }}
          >
            <Environment environmentIntensity={0.4} preset="studio" />
            {item.model ? (
              <Suspense
                fallback={
                  <Html center>
                    <p className="font-mono text-xs uppercase">Loading...</p>
                  </Html>
                }
              >
                <Model item={item} stopRotation={isHovered} />
              </Suspense>
            ) : null}
            <OrbitControls />
          </Canvas>
        </>
      )}
      <div className="w-full h-6 flex items-center justify-between absolute bottom-2 px-2">
        {isWanted && (
          <>
            <BuyButton />
            <StatusButton />
          </>
        )}
        <AnimatePresence>
          {isHovered ? (
            <motion.button
              key="toggle-wanted"
              className="bg-black text-white font-mono text-xs uppercase p-1 block w-full cursor-pointer"
              onClick={handleClickToggleWanted}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {isWanted ? "Actually, no..." : "I want it!"}
            </motion.button>
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
        </AnimatePresence>
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
        id: "100",
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

export const StatusButton = () => {
  const handleStatus = async () => {
    const contactApi =
      process.env.NODE_ENV === "production" ? "/api/status.php" : "/api/status";
    const res = await fetch(contactApi, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    console.log("Status fetched successfully", data);
  };

  return <button onClick={handleStatus}>Check Status</button>;
};
