"use client";

import { Item } from "@/components/item";
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import { Group } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

const Object = ({
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
    <group ref={ref} rotation={[0, item.rotation, 0]}>
      <primitive object={result.scene} />
    </group>
  );
};

export const Model = ({ item }: { item: Item }) => {
  const [isControlling, setIsControlling] = useState(false);

  return (
    <div className="relative w-full h-full min-h-0">
      <Canvas
        className="cursor-move"
        style={{ position: "absolute", inset: 0 }}
        camera={{ position: [0, 0, item.position], fov: 50 }}
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
            <Object item={item} stopRotation={isControlling} />
          </Suspense>
        ) : null}
        <OrbitControls
          enablePan={false}
          onStart={() => setIsControlling(true)}
          onEnd={() => setIsControlling(false)}
        />
      </Canvas>
    </div>
  );
};
