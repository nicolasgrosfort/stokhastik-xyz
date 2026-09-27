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
    new THREE.Vector3(
      20.703749057110425,
      2.5927876694648977,
      23.118696180970883,
    ),
    new THREE.Vector3(
      12.606085985851113,
      1.1858197601757416,
      9.743085933030645,
    ),
    new THREE.Vector3(
      -1.0240869938894979,
      1.3006913236175528,
      -0.010041441163111085,
    ),
    new THREE.Vector3(
      -1.402183367131699,
      3.904024652036796,
      -1.8820109468286763,
    ),
    new THREE.Vector3(
      12.099815057120152,
      1.5918887732706526,
      4.041013711627714,
    ),
    new THREE.Vector3(9.334348530115431, 1.209903387154438, 5.277631221097255),
  ],
  true,
);

const cameraLookAts = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(18.93817893978408, 2.3895181751821983, 20.70178830653746),
    new THREE.Vector3(
      12.996282324122204,
      0.6036123708923422,
      6.826104381243997,
    ),
    new THREE.Vector3(
      1.312463442996378,
      1.0784560625488608,
      -1.8785016480249417,
    ),
    new THREE.Vector3(
      0.3453183851518786,
      1.993405877948177,
      -3.3971919676528977,
    ),
    new THREE.Vector3(10.235771384269784, 0.9932226344838284, 1.76792329548132),
    new THREE.Vector3(7.487553439029362, 0.8305142193317623, 2.944090617019576),
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
