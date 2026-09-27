"use client";

import { Annotation, ModelAnnotation } from "@/components/common/model";
import {
  OrbitControls,
  PresentationControls,
  useScroll,
} from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

// Trajet généré automatiquement pour passer par les 4 annotations
// (Korean Dog, Shishi, Ema, Omikuji machine) : caméra placée à 3 unités de
// chaque point, dans la direction opposée au centre du groupe de points
// d'intérêt, regardant vers le point. À remplacer par un trajet capturé à la
// main (mode FPS de /models, bouton "Copier le code") si le rendu heurte des
// murs/objets ou manque de naturel.
const cameraPositions = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(15.2212, 1.6042, 8.1181), // Korean Dog
    new THREE.Vector3(5.6423, 2.2149, 5.1723), // Shishi
    new THREE.Vector3(-2.1045, 3.276, -5.3486), // Ema
    new THREE.Vector3(13.0825, 2.2657, 1.1439), // Omikuji machine
  ],
  true,
);

const cameraLookAts = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(12.937906805620601, 0.8042247661480963, 6.171422808775111), // Korean Dog
    new THREE.Vector3(7.1047785339646055, 1.4149274596081198, 2.5526573561854162), // Shishi
    new THREE.Vector3(0.3321333239687341, 2.4760233008465846, -3.59870953066046), // Ema
    new THREE.Vector3(10.095138040616101, 1.465730895485213, 1.4120716703744294), // Omikuji machine
  ],
  true,
);

// Debug view: R3F's default camera (0,0,5 looking at the origin) sits nowhere
// near the annotated objects in this scene, so free-orbit mode would open on
// an arbitrary, disorienting angle. Start it centred on the annotation
// cluster instead, so "does the label sit on the object" is actually
// checkable.
const FREE_CAMERA_START = new THREE.Vector3(2.62, 7.54, 13.63);
const FREE_CAMERA_TARGET: [number, number, number] = [7.62, 1.54, 1.63];

const FreeCameraStart = () => {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.position.copy(FREE_CAMERA_START);
    camera.lookAt(...FREE_CAMERA_TARGET);
  }, [camera]);

  return null;
};

const ScriptedCamera = () => {
  const scroll = useScroll();

  useFrame((state) => {
    const t = scroll.range(0, 1);
    state.camera.position.copy(cameraPositions.getPointAt(t));
    state.camera.lookAt(cameraLookAts.getPointAt(t));
  });

  return null;
};

export const PlyModel = ({
  model,
  pointSize = 0.001,
  annotations,
  freeCamera,
}: {
  model: string;
  pointSize?: number;
  annotations?: ModelAnnotation[];
  freeCamera?: boolean;
}) => {
  const geometry = useLoader(PLYLoader, model);
  const scroll = useScroll();
  // ScrollControls reconnects R3F's events to its own scrolling container, so
  // <Html> would otherwise portal into it and drift with native scroll while
  // the WebGL-rendered point cloud stays put. `scroll.fixed` is the sticky,
  // non-scrolling viewport-sized div ScrollControls provides for this.
  const htmlPortal = useMemo(() => ({ current: scroll.fixed }), [scroll.fixed]);

  return (
    <>
      {freeCamera ? (
        <>
          <FreeCameraStart />
          <OrbitControls makeDefault target={FREE_CAMERA_TARGET} />
        </>
      ) : (
        <ScriptedCamera />
      )}
      <PresentationControls
        enabled={!freeCamera}
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
        {annotations?.map((annotation, index) => (
          <Annotation key={index} {...annotation} htmlPortal={htmlPortal} />
        ))}
      </PresentationControls>
    </>
  );
};
