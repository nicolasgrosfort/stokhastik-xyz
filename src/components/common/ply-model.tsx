"use client";

import { PresentationControls, useScroll } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

const cameraPositions = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(
      -1.6256055866001757,
      0.6881068841635096,
      7.664192492073572,
    ),
    new THREE.Vector3(
      0.02437966416574558,
      0.46704108317457854,
      1.8626530826072376,
    ),
    new THREE.Vector3(
      -0.35528311343284374,
      0.2765189015558236,
      -0.8546124923652038,
    ),
    new THREE.Vector3(
      4.327990703741863,
      1.2093983242867823,
      -4.9612736424369865,
    ),
    new THREE.Vector3(
      1.4045183009293494,
      8.222793425982458,
      -2.3680868974789777,
    ),
  ],
  true,
);

const cameraLookAts = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(
      -1.1568933415493632,
      0.2813757863839488,
      4.729081140618834,
    ),
    new THREE.Vector3(
      1.3286018833898647,
      0.3171160116311158,
      -0.8348507405234729,
    ),
    new THREE.Vector3(
      1.9740964753127888,
      -0.022968958760536284,
      1.0120148815523544,
    ),
    new THREE.Vector3(
      2.2537307631346533,
      0.6487270264252458,
      -2.867689778688883,
    ),
    new THREE.Vector3(
      0.8347392834612737,
      5.31078796814162,
      -1.9258470476708838,
    ),
  ],
  true,
);

// // Récupérés depuis le panneau admin de /models (mode FPS, bouton "Copier le
// // code") : une paire position/lookAt par point, capturée en volant dans la
// // scène. cameraPositions[i] et cameraLookAts[i] se correspondent.
// const cameraPositions = new THREE.CatmullRomCurve3(
//   [
//     new THREE.Vector3(0, 0, 0),
//     new THREE.Vector3(3, 3, 0),
//     new THREE.Vector3(0, 3, 2),
//     new THREE.Vector3(3, 3, 3),
//     new THREE.Vector3(6, 5, 5),
//     new THREE.Vector3(5, 5, 5),
//   ],
//   true,
// );

// // Défaut le temps de capturer les vrais points : regarde le waypoint suivant
// // sur le trajet, ce qui suit déjà la direction du déplacement.
// const cameraLookAts = new THREE.CatmullRomCurve3(
//   cameraPositions.points.map(
//     (_, index) =>
//       cameraPositions.points[(index + 1) % cameraPositions.points.length],
//   ),
//   true,
// );

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
    state.camera.position.copy(cameraPositions.getPointAt(t));
    state.camera.lookAt(cameraLookAts.getPointAt(t));
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
