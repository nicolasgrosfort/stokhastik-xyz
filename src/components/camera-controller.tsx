import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";

export function CameraController({
  position,
  lookAt,
}: {
  position: Vector3 | null;
  lookAt: Vector3 | null;
}) {
  const { camera } = useThree();

  const currentLookAt = useRef(new Vector3());

  useFrame(() => {
    if (position) {
      camera.position.lerp(position, 0.08);

      if (camera.position.distanceTo(position) < 0.01) {
        camera.position.copy(position);
      }
    }

    if (lookAt) {
      currentLookAt.current.lerp(lookAt, 0.08);

      if (currentLookAt.current.distanceTo(lookAt) < 0.01) {
        currentLookAt.current.copy(lookAt);
      }

      camera.lookAt(currentLookAt.current);
    }
  });

  return null;
}
