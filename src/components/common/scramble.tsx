import { useEffect, useRef } from "react";
import { useScramble } from "use-scramble";

export const Scramble = ({
  children,
  playOnMount = false,
  playOnHover = false,
  playOnFocus = false,
  playRandomly = false,
  randomIntervalRange = [2000, 6000],
}: {
  children: string;
  playOnMount?: boolean;
  playOnHover?: boolean;
  playOnFocus?: boolean;
  playRandomly?: boolean;
  randomIntervalRange?: [min: number, max: number];
}) => {
  const { ref, replay } = useScramble({
    text: children,
    speed: 0.5,
    tick: 2,
    step: 1,
    overflow: true,
    seed: 8,
    overdrive: true,
    playOnMount: playOnMount,
  });

  const replayRef = useRef(replay);
  replayRef.current = replay;

  const [min, max] = randomIntervalRange;

  useEffect(() => {
    if (!playRandomly) return;

    let timeout: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay = min + Math.random() * (max - min);
      timeout = setTimeout(() => {
        replayRef.current();
        schedule();
      }, delay);
    };
    schedule();

    return () => clearTimeout(timeout);
  }, [playRandomly, min, max]);

  return (
    <span
      ref={ref}
      onMouseOver={playOnHover ? replay : undefined}
      onFocus={playOnFocus ? replay : undefined}
    />
  );
};
