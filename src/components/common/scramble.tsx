import { useScramble } from "use-scramble";

export const Scramble = ({ children }: { children: string }) => {
  const { ref, replay } = useScramble({
    text: children,
    speed: 0.5,
    tick: 2,
    step: 1,
    overflow: true,
    seed: 8,
    overdrive: true,
    playOnMount: false,
  });
  return <span ref={ref} onMouseOver={replay} onFocus={replay} />;
};
