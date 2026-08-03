"use client";

import { H1 } from "@/components/h1";
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { animate, motion } from "motion/react";
import { useRef } from "react";
import * as THREE from "three";

export default function Map() {
  return (
    <div className="w-full h-full">
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  );
}

const Scene = () => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  const focusOn = (position: THREE.Vector3) => {
    const target = controlsRef.current.target;

    animate(target.x, position.x, {
      duration: 0.6,
      onUpdate: (v) => {
        target.x = v;
        controlsRef.current.update();
      },
    });

    animate(target.y, position.y, {
      duration: 0.6,
      onUpdate: (v) => {
        target.y = v;
        controlsRef.current.update();
      },
    });

    animate(target.z, position.z, {
      duration: 0.6,
      onUpdate: (v) => {
        target.z = v;
        controlsRef.current.update();
      },
    });

    animate(camera.position.x, position.x, {
      duration: 0.6,
      onUpdate: (v) => {
        camera.position.x = v;
      },
    });

    animate(camera.position.y, position.y, {
      duration: 0.6,
      onUpdate: (v) => {
        camera.position.y = v;
      },
    });

    animate(camera.position.z, position.z + 1, {
      duration: 0.6,
      onUpdate: (v) => {
        camera.position.z = v;
        controlsRef.current.update();
      },
    });
  };

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableRotate={false}
        enablePan={true}
        enableZoom={true}
        maxDistance={20}
        minDistance={1}
        zoomToCursor={true}
        mouseButtons={{
          LEFT: 2,
          MIDDLE: 1,
          RIGHT: 0,
        }}
      />
      <Card
        position={new THREE.Vector3(0, 0, 0)}
        onClick={() => focusOn(new THREE.Vector3(0, 0, 0))}
        title="Card 1"
      />
      <Card
        position={new THREE.Vector3(2, 0, 0)}
        onClick={() => focusOn(new THREE.Vector3(2, 0, 0))}
        title="Card 2"
      />
    </>
  );
};

const Card = (props: {
  position: THREE.Vector3;
  onClick: () => void;
  title: string;
}) => {
  return (
    <group position={props.position}>
      <Html transform center distanceFactor={1}>
        <motion.article
          onClick={props.onClick}
          style={{
            width: "300px",
            height: "200px",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <H1>{props.title}</H1>
        </motion.article>
      </Html>
    </group>
  );
};
