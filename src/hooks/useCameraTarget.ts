"use client";

import { parseAsArrayOf, parseAsFloat, useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";
import { Vector3 } from "three";

const positionParser = parseAsArrayOf(parseAsFloat);

export function useCameraTarget() {
  const [pos, setPos] = useQueryState("pos", positionParser);

  const target = useMemo(
    () => (pos && pos.length === 3 ? new Vector3(pos[0], pos[1], pos[2]) : null),
    [pos],
  );

  const setTarget = useCallback(
    (next: Vector3 | [number, number, number] | null) => {
      if (next === null) {
        setPos(null);
        return;
      }
      const [x, y, z] = next instanceof Vector3 ? next.toArray() : next;
      setPos([x, y, z]);
    },
    [setPos],
  );

  return { target, setTarget };
}
