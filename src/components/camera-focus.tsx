"use client";

import { useCameraTarget } from "@/hooks/useCameraTarget";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Matrix4, Quaternion, Vector3 } from "three";

const ARRIVAL_DISTANCE = 0.01;
const ARRIVAL_ANGLE = 0.01;

export const CameraFocus = ({
  speed = 2,
  offset,
}: {
  speed?: number;
  offset?: Vector3;
}) => {
  const { target, setTarget } = useCameraTarget();
  const desiredPosition = useRef(new Vector3());
  const lookMatrix = useRef(new Matrix4());
  const lookQuaternion = useRef(new Quaternion());

  useFrame(({ camera }, delta) => {
    if (!target) return;
    const t = 1 - Math.exp(-speed * delta);

    desiredPosition.current.copy(target);
    if (offset) desiredPosition.current.add(offset);
    camera.position.lerp(desiredPosition.current, t);

    lookMatrix.current.lookAt(camera.position, target, camera.up);
    lookQuaternion.current.setFromRotationMatrix(lookMatrix.current);
    camera.quaternion.slerp(lookQuaternion.current, t);

    const arrived =
      camera.position.distanceTo(desiredPosition.current) < ARRIVAL_DISTANCE &&
      camera.quaternion.angleTo(lookQuaternion.current) < ARRIVAL_ANGLE;
    if (arrived) setTarget(null);
  });

  return null;
};
