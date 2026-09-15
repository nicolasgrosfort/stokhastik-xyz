"use client";

import { GetStoreItem } from "@/libs/store-item";
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import Image from "next/image";
import { Suspense, useMemo, useRef, useState } from "react";
import { Float32BufferAttribute, Group } from "three";
import {
  DRACOLoader,
  GLTFLoader,
  PLYLoader,
} from "three/examples/jsm/Addons.js";

const dracoLoader = new DRACOLoader();

const isPly = (model: string) => model.split(".").pop()?.toLowerCase() === "ply";

const GltfObject = ({ model }: { model: string }) => {
  const result = useLoader(GLTFLoader, model, (loader) => {
    loader.setDRACOLoader(dracoLoader);
  });

  return <primitive object={result.scene} />;
};

// Spherical harmonics DC-term to RGB, as used by 3D Gaussian Splatting exports
// (properties f_dc_0/1/2) that have no plain red/green/blue color.
const SH_C0 = 0.28209479177387814;

const configurePlyLoader = (loader: PLYLoader) => {
  loader.setCustomPropertyNameMapping({
    sh: ["f_dc_0", "f_dc_1", "f_dc_2"],
  });
};

const PlyObject = ({ model }: { model: string }) => {
  const geometry = useLoader(PLYLoader, model, configurePlyLoader);

  useMemo(() => {
    if (geometry.hasAttribute("color")) return;

    const sh = geometry.getAttribute("sh");
    if (!sh) return;

    const colors = new Float32Array(sh.count * 3);
    for (let i = 0; i < sh.count; i++) {
      colors[i * 3] = Math.min(1, Math.max(0, 0.5 + SH_C0 * sh.getX(i)));
      colors[i * 3 + 1] = Math.min(1, Math.max(0, 0.5 + SH_C0 * sh.getY(i)));
      colors[i * 3 + 2] = Math.min(1, Math.max(0, 0.5 + SH_C0 * sh.getZ(i)));
    }

    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  }, [geometry]);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.01}
        vertexColors={geometry.hasAttribute("color")}
        sizeAttenuation
      />
    </points>
  );
};

const Object = ({
  stopRotation,
  model,
  rotation,
}: {
  model: string;
  rotation: GetStoreItem["rotation"];
  stopRotation?: boolean;
}) => {
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ref.current && !stopRotation) {
      ref.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={ref} rotation={[0, rotation, 0]}>
      {isPly(model) ? (
        <PlyObject model={model} />
      ) : (
        <GltfObject model={model} />
      )}
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
