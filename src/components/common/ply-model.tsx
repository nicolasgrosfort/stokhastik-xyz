"use client";

import { PresentationControls, useScroll } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

const curve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(3, 3, 0),
    new THREE.Vector3(0, 3, 2),
    new THREE.Vector3(3, 3, 3),
    new THREE.Vector3(6, 5, 5),
    new THREE.Vector3(5, 5, 5),
  ],
  true,
);

export const PlyModel = ({
  model,
  pointSize = 0.001,
}: {
  model: string;
  pointSize?: number;
}) => {
  const geometry = useLoader(PLYLoader, model);
  const scroll = useScroll();

  useFrame((state) => {
    const t = scroll.range(0, 1);
    const position = curve.getPointAt(t);

    console.log("Scroll offset:", t);

    state.camera.position.copy(position);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <PresentationControls
        enabled
        global
        snap
        polar={[-Math.PI / 2, Math.PI / 2]}
      >
        <points geometry={geometry}>
          <pointsMaterial
            size={pointSize}
            vertexColors={geometry.hasAttribute("color")}
            sizeAttenuation
          />
        </points>
      </PresentationControls>
    </>
  );
};
