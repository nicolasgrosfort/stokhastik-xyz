import { useScramble } from "use-scramble";

export const Scramble = ({
  children,
  playOnMount = false,
  playOnHover = false,
  playOnFocus = false,
}: {
  children: string;
  playOnMount?: boolean;
  playOnHover?: boolean;
  playOnFocus?: boolean;
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
  return (
    <span
      ref={ref}
      onMouseOver={playOnHover ? replay : undefined}
      onFocus={playOnFocus ? replay : undefined}
    />
  );
};
