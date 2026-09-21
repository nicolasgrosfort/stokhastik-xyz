"use client";

import { useAudio } from "@/hooks/useAudio";
import { GetStoreItem } from "@/libs/store-item";
import { Html, Line, OrbitControls, PositionalAudio } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import Image from "next/image";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Float32BufferAttribute, Group } from "three";
import {
  DRACOLoader,
  GLTFLoader,
  PLYLoader,
} from "three/examples/jsm/Addons.js";

const dracoLoader = new DRACOLoader();

const isPly = (model: string) =>
  model.split(".").pop()?.toLowerCase() === "ply";

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

const PlyObject = ({
  model,
  pointSize,
}: {
  model: string;
  pointSize?: number;
}) => {
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
        size={pointSize ?? 0.01}
        vertexColors={geometry.hasAttribute("color")}
        sizeAttenuation
      />
    </points>
  );
};

export type ModelAnnotation = {
  text: string;
  point: [number, number, number];
  labelOffset?: [number, number, number];
  labelModel?: string;
  labelModelScale?: number;
};

const RotatingModel = ({
  model,
  scale = 1,
  spin,
}: {
  model: string;
  scale?: number;
  spin: boolean;
}) => {
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ref.current && spin) {
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={ref} scale={scale}>
      <GltfObject model={model} />
    </group>
  );
};

const AnnotationModelLabel = ({
  model,
  scale,
}: {
  model: string;
  scale?: number;
}) => {
  const [isControlling, setIsControlling] = useState(false);

  return (
    <div
      className="size-16 touch-none cursor-grab select-none active:cursor-grabbing"
      onPointerDown={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <Canvas camera={{ position: [1.2, 1.2, 1.2], fov: 40 }}>
        <ambientLight intensity={2} />
        <Suspense fallback={null}>
          <RotatingModel model={model} scale={scale} spin={!isControlling} />
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

const Annotation = ({
  text,
  point,
  labelOffset = [0.5, 0.5, 0],
  labelModel,
  labelModelScale,
}: ModelAnnotation) => {
  const labelPosition: [number, number, number] = [
    point[0] + labelOffset[0],
    point[1] + labelOffset[1],
    point[2] + labelOffset[2],
  ];

  return (
    <>
      <Line points={[point, labelPosition]} color="white" lineWidth={1.2} />
      <Html position={point} center>
        <div className="size-2 rounded-full border-2 border-white bg-black" />
      </Html>
      <Html position={labelPosition} center>
        <div className="flex flex-col items-center gap-1 border border-foreground bg-background/60 p-2 shadow-md backdrop-blur-sm select-none">
          <span className="font-mono text-xs uppercase">{text}</span>
          {labelModel && (
            <AnnotationModelLabel model={labelModel} scale={labelModelScale} />
          )}
        </div>
      </Html>
    </>
  );
};

export type CameraPosition = [number, number, number];

const CAMERA_SETTLE_DELAY = 400;

const CameraDistance = ({
  distance,
  keepInitialPosition,
}: {
  distance: number;
  keepInitialPosition: boolean;
}) => {
  const camera = useThree((state) => state.camera);
  const lastDistance = useRef<number | null>(
    keepInitialPosition ? distance : null,
  );

  useEffect(() => {
    if (lastDistance.current === distance) return;
    lastDistance.current = distance;
    camera.position.set(distance, distance, distance);
  }, [camera, distance]);

  return null;
};

const ModelAudio = ({ url, distance }: { url: string; distance: number }) => {
  const enabled = useAudio((state) => state.enabled);

  if (!enabled) return null;

  return (
    <Suspense fallback={null}>
      <PositionalAudio url={url} distance={distance} loop autoplay />
    </Suspense>
  );
};

const Object = ({
  stopRotation,
  model,
  rotation,
  pointSize,
  annotations,
  audio,
  audioDistance,
}: {
  model: string;
  rotation: GetStoreItem["rotation"];
  stopRotation?: boolean;
  pointSize?: number;
  annotations?: ModelAnnotation[];
  audio?: string;
  audioDistance: number;
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
        <PlyObject model={model} pointSize={pointSize} />
      ) : (
        <GltfObject model={model} />
      )}
      {annotations?.map((annotation, index) => (
        <Annotation key={index} {...annotation} />
      ))}
      {audio && <ModelAudio url={audio} distance={audioDistance} />}
    </group>
  );
};

export const Model = ({
  position,
  rotation,
  model,
  thumbnail,
  stopRotation,
  enablePan,
  pointSize,
  annotations,
  audio,
  cameraPosition,
  onCameraChange,
}: {
  position: GetStoreItem["position"];
  rotation: GetStoreItem["rotation"];
  model: GetStoreItem["model"];
  thumbnail?: GetStoreItem["thumbnail"];
  stopRotation?: boolean;
  enablePan?: boolean;
  pointSize?: number;
  annotations?: ModelAnnotation[];
  audio?: string;
  cameraPosition?: CameraPosition;
  onCameraChange?: (position: CameraPosition) => void;
}) => {
  const [isControlling, setIsControlling] = useState(false);
  const initialCameraPosition = useRef(cameraPosition);
  const settleTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => () => clearTimeout(settleTimeout.current), []);

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
        onCreated={({ camera }) => {
          cameraRef.current = camera;
        }}
        camera={{
          position: initialCameraPosition.current ?? [
            position,
            position,
            position,
          ],
          fov: 50,
        }}
      >
        <ambientLight intensity={2} />
        <CameraDistance
          distance={position}
          keepInitialPosition={!!initialCameraPosition.current}
        />
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
            pointSize={pointSize}
            stopRotation={stopRotation || isControlling}
            annotations={annotations}
            audio={audio}
            audioDistance={position}
          />
        </Suspense>
        <OrbitControls
          enablePan={enablePan ?? false}
          onStart={() => {
            clearTimeout(settleTimeout.current);
            setIsControlling(true);
          }}
          onEnd={() => {
            setIsControlling(false);
            const camera = cameraRef.current;
            if (!onCameraChange || !camera) return;

            // Damping keeps moving the camera after the pointer is released.
            clearTimeout(settleTimeout.current);
            settleTimeout.current = setTimeout(() => {
              onCameraChange([
                camera.position.x,
                camera.position.y,
                camera.position.z,
              ]);
            }, CAMERA_SETTLE_DELAY);
          }}
        />
      </Canvas>
    </div>
  );
};
