"use client";

import { useAudio } from "@/hooks/useAudio";
import { GetStoreItem } from "@/libs/store-item";
import {
  Html,
  KeyboardControls,
  Line,
  OrbitControls,
  PositionalAudio,
  useKeyboardControls,
} from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import Image from "next/image";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Euler, Float32BufferAttribute, Group, Vector3 } from "three";
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

export type CameraSample = {
  position: CameraPosition;
  lookAt: CameraPosition;
};

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

type FpsControlName = "forward" | "backward" | "left" | "right" | "up" | "down";

const fpsKeyboardMap: { name: FpsControlName; keys: string[] }[] = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "up", keys: ["Space", "KeyE"] },
  { name: "down", keys: ["ShiftLeft", "ShiftRight", "KeyQ"] },
];

const FPS_SPEED = 4;
const CAMERA_REPORT_INTERVAL = 0.1;

const FreeFlyMovement = () => {
  const [, getKeys] = useKeyboardControls<FpsControlName>();
  const direction = useRef(new Vector3());
  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());

  useFrame(({ camera }, delta) => {
    const keys = getKeys();
    if (
      !keys.forward &&
      !keys.backward &&
      !keys.left &&
      !keys.right &&
      !keys.up &&
      !keys.down
    ) {
      return;
    }

    camera.getWorldDirection(forward.current);
    right.current.crossVectors(forward.current, camera.up).normalize();

    direction.current.set(0, 0, 0);
    if (keys.forward) direction.current.add(forward.current);
    if (keys.backward) direction.current.sub(forward.current);
    if (keys.right) direction.current.add(right.current);
    if (keys.left) direction.current.sub(right.current);
    if (keys.up) direction.current.y += 1;
    if (keys.down) direction.current.y -= 1;

    if (direction.current.lengthSq() === 0) return;
    direction.current.normalize().multiplyScalar(FPS_SPEED * delta);
    camera.position.add(direction.current);
  });

  return null;
};

const LOOK_AT_DISTANCE = 3;

const CameraPositionReporter = ({
  onFrame,
}: {
  onFrame: (sample: CameraSample) => void;
}) => {
  const lastReport = useRef(0);
  const forward = useRef(new Vector3());
  const lookAt = useRef(new Vector3());

  useFrame(({ camera, clock }) => {
    if (clock.elapsedTime - lastReport.current < CAMERA_REPORT_INTERVAL) return;
    lastReport.current = clock.elapsedTime;

    camera.getWorldDirection(forward.current);
    lookAt.current
      .copy(camera.position)
      .addScaledVector(forward.current, LOOK_AT_DISTANCE);

    onFrame({
      position: [camera.position.x, camera.position.y, camera.position.z],
      lookAt: [lookAt.current.x, lookAt.current.y, lookAt.current.z],
    });
  });

  return null;
};

const LOOK_SENSITIVITY = 0.0025;
const PITCH_LIMIT = Math.PI / 2 - 0.05;

// Click-and-drag look instead of PointerLockControls: pointer lock ties into
// Safari's fullscreen presentation, so Escape (which browsers never let a
// page intercept) drops the whole window out of fullscreen there. Dragging
// avoids requesting pointer lock at all, at the cost of the look no longer
// being unbounded past the screen edge.
const DragLookControls = ({
  onDraggingChange,
}: {
  onDraggingChange: (dragging: boolean) => void;
}) => {
  const { gl, camera } = useThree();
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const euler = useRef(new Euler(0, 0, 0, "YXZ"));

  useEffect(() => {
    const domElement = gl.domElement;

    const onPointerDown = (event: PointerEvent) => {
      isDragging.current = true;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      domElement.setPointerCapture(event.pointerId);
      onDraggingChange(true);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = event.clientX - lastPointer.current.x;
      const deltaY = event.clientY - lastPointer.current.y;
      lastPointer.current = { x: event.clientX, y: event.clientY };

      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= deltaX * LOOK_SENSITIVITY;
      euler.current.x -= deltaY * LOOK_SENSITIVITY;
      euler.current.x = Math.max(
        -PITCH_LIMIT,
        Math.min(PITCH_LIMIT, euler.current.x),
      );
      camera.quaternion.setFromEuler(euler.current);
    };

    const onPointerUp = (event: PointerEvent) => {
      isDragging.current = false;
      domElement.releasePointerCapture(event.pointerId);
      onDraggingChange(false);
    };

    domElement.addEventListener("pointerdown", onPointerDown);
    domElement.addEventListener("pointermove", onPointerMove);
    domElement.addEventListener("pointerup", onPointerUp);
    domElement.addEventListener("pointercancel", onPointerUp);

    return () => {
      domElement.removeEventListener("pointerdown", onPointerDown);
      domElement.removeEventListener("pointermove", onPointerMove);
      domElement.removeEventListener("pointerup", onPointerUp);
      domElement.removeEventListener("pointercancel", onPointerUp);
    };
  }, [gl, camera, onDraggingChange]);

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
  fpsMode,
  onCameraFrame,
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
  fpsMode?: boolean;
  onCameraFrame?: (sample: CameraSample) => void;
}) => {
  const [isControlling, setIsControlling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
      <KeyboardControls map={fpsKeyboardMap}>
        <Canvas
          className={
            fpsMode
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-move"
          }
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
          {fpsMode ? (
            <>
              <FreeFlyMovement />
              <DragLookControls onDraggingChange={setIsDragging} />
            </>
          ) : (
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
          )}
          {onCameraFrame && <CameraPositionReporter onFrame={onCameraFrame} />}
        </Canvas>
      </KeyboardControls>
      {fpsMode && !isDragging && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center">
          <p className="border border-foreground bg-background/60 px-3 py-1.5 font-mono text-xs uppercase shadow-md backdrop-blur-sm">
            Cliquer-glisser pour regarder · WASD · Q/E bas/haut
          </p>
        </div>
      )}
    </div>
  );
};
