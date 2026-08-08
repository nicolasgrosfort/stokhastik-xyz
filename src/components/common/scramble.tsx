"use client";

import { motion, useAnimationFrame } from "motion/react";
import type { ReactNode, RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_DELAY = 0;
const DEFAULT_CYCLES = 8;
const DEFAULT_SHUFFLE_TIME = 40;
const DEFAULT_CHARS = "!@#$%^&*()_+-=[]{}|;:',.<>/?~⚡✶⚇↑↗→↘↓↙←↖↔";

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Un seul jeu d'écouteurs "touch" partagé par toutes les lettres montées sur
// la page : on évite d'empiler un listener document par instance de Scramble,
// et une lettre s'enregistre simplement dans ce registre pour être
// déclenchable au doigt lorsqu'il glisse par-dessus.
const scrambleTriggers = new WeakMap<Element, () => void>();
const triggeredThisGesture = new Set<Element>();
let listenerRefCount = 0;

const handleTouchStart = () => {
  triggeredThisGesture.clear();
};

const handleTouchMove = (event: TouchEvent) => {
  const touch = event.touches[0];
  if (!touch) return;

  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (!target || triggeredThisGesture.has(target)) return;

  const trigger = scrambleTriggers.get(target);
  if (!trigger) return;

  triggeredThisGesture.add(target);
  trigger();
};

const handleTouchEnd = () => {
  triggeredThisGesture.clear();
};

const useSwipeToScramble = (
  ref: RefObject<HTMLSpanElement | null>,
  trigger: () => void,
) => {
  useEffect(() => {
    if (listenerRefCount === 0) {
      document.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      document.addEventListener("touchmove", handleTouchMove, {
        passive: true,
      });
      document.addEventListener("touchend", handleTouchEnd, {
        passive: true,
      });
      document.addEventListener("touchcancel", handleTouchEnd, {
        passive: true,
      });
    }
    listenerRefCount++;

    return () => {
      listenerRefCount--;
      if (listenerRefCount === 0) {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("touchcancel", handleTouchEnd);
      }
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    scrambleTriggers.set(el, trigger);
    return () => {
      scrambleTriggers.delete(el);
    };
  }, [ref, trigger]);
};

type UseScrambleOptions = {
  letter: string;
  chars: string;
  cycles: number;
  shuffleTime: number;
  delay: number;
  scrambleOnMount: boolean;
};

// Boucle d'animation pilotée par la frame loop partagée de motion (au lieu
// d'un requestAnimationFrame indépendant par lettre) : un seul scheduler pour
// toutes les lettres de la page, et le nettoyage à l'unmount est automatique.
const useScramble = ({
  letter,
  chars,
  cycles,
  shuffleTime,
  delay,
  scrambleOnMount,
}: UseScrambleOptions) => {
  const [display, setDisplay] = useState(scrambleOnMount ? "" : letter);
  const isAnimating = useRef(false);
  const elapsed = useRef(0);
  const cycle = useRef(0);
  const startTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useAnimationFrame((_, delta) => {
    if (!isAnimating.current) return;

    elapsed.current += delta;
    if (elapsed.current < shuffleTime) return;
    elapsed.current = 0;

    if (cycle.current >= cycles) {
      isAnimating.current = false;
      setDisplay(letter);
      return;
    }

    cycle.current++;
    setDisplay(chars[Math.floor(Math.random() * chars.length)]);
  });

  const start = useCallback(() => {
    if (isAnimating.current) return;

    clearTimeout(startTimeout.current);
    cycle.current = 0;
    elapsed.current = 0;

    startTimeout.current = setTimeout(() => {
      isAnimating.current = true;
    }, delay);
  }, [delay]);

  useEffect(() => {
    if (scrambleOnMount) start();
    return () => clearTimeout(startTimeout.current);
  }, [scrambleOnMount, start]);

  return { display, start };
};

type LetterProps = {
  letter: string;
  delay?: number;
  cycles?: number;
  shuffleTime?: number;
  underline?: boolean;
  chars?: string;
  scrambleOnMount?: boolean;
};

const Letter = ({
  letter,
  delay = DEFAULT_DELAY,
  cycles = DEFAULT_CYCLES,
  shuffleTime = DEFAULT_SHUFFLE_TIME,
  underline = false,
  chars = DEFAULT_CHARS,
  scrambleOnMount = false,
}: LetterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const { display, start } = useScramble({
    letter,
    chars,
    cycles,
    shuffleTime,
    delay,
    scrambleOnMount,
  });

  useSwipeToScramble(ref, start);

  return (
    <motion.span
      ref={ref}
      onMouseEnter={letter === " " ? undefined : start}
      style={{
        display: "inline-block",
        whiteSpace: "pre",
        touchAction: "manipulation",
        textDecoration: underline ? "underline" : "inherit",
        userSelect: "none",
      }}
    >
      {letter === "" ? " " : display}
    </motion.span>
  );
};

type LetterConfig = {
  letter: string;
  delay: number;
  cycles: number;
  shuffleTime: number;
};

const useLetterConfigs = (text: string): LetterConfig[] =>
  useMemo(
    () =>
      text.split("").map((letter) => ({
        letter,
        delay: randomInt(0, 120),
        cycles: randomInt(8, 13),
        shuffleTime: randomInt(40, 60),
      })),
    [text],
  );

type ScrambleProps = {
  children: string;
  whitespace?: "nowrap" | "wrap" | "pre";
  scrambleOnMount?: boolean;
  underline?: boolean;
};

const toCssWhiteSpace = (whitespace: ScrambleProps["whitespace"]) =>
  whitespace === "wrap" ? "normal" : whitespace;

export const Scramble = ({
  children,
  whitespace = "nowrap",
  scrambleOnMount = false,
  underline = false,
}: ScrambleProps) => {
  const letters = useLetterConfigs(children);

  return (
    <motion.span style={{ whiteSpace: toCssWhiteSpace(whitespace) }}>
      {letters.map(({ letter, delay, cycles, shuffleTime }, id) => (
        <Letter
          scrambleOnMount={scrambleOnMount}
          key={id}
          underline={underline}
          letter={letter}
          delay={delay}
          cycles={cycles}
          shuffleTime={shuffleTime}
        />
      ))}
    </motion.span>
  );
};

// Un mot, encapsulé pour ne jamais être coupé par le retour à la ligne.
const Word = ({
  word,
  scrambleOnMount,
  underline,
}: {
  word: string;
  scrambleOnMount: boolean;
  underline: boolean;
}) => {
  const letters = useLetterConfigs(word);

  return (
    <motion.span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
      {letters.map(({ letter, delay, cycles, shuffleTime }, id) => (
        <Letter
          scrambleOnMount={scrambleOnMount}
          key={id}
          underline={underline}
          letter={letter}
          delay={delay}
          cycles={cycles}
          shuffleTime={shuffleTime}
        />
      ))}
    </motion.span>
  );
};

const parseTextWithLineBreaks = (
  text: string,
  options: { scrambleOnMount: boolean; underline: boolean },
) => {
  const lines = text.split("\n");
  const elements: ReactNode[] = [];
  let id = 0;

  lines.forEach((line, lineIndex) => {
    if (line.trim() === "") {
      elements.push(<br key={`br-${id++}`} />);
    } else {
      for (const segment of line.split(/(\s+)/)) {
        if (segment === "") continue;

        if (/^\s+$/.test(segment)) {
          elements.push(<span key={`space-${id++}`}>{segment}</span>);
        } else {
          elements.push(
            <Word key={`word-${id++}`} word={segment} {...options} />,
          );
        }
      }
    }

    if (lineIndex < lines.length - 1) {
      elements.push(<br key={`line-br-${id++}`} />);
    }
  });

  return elements;
};

// Variante pour les blocs de texte multi-lignes : les sauts de ligne (\n)
// sont respectés et chaque mot peut passer à la ligne indépendamment.
export const ParagraphScramble = ({
  children,
  whitespace = "wrap",
  scrambleOnMount = false,
  underline = false,
}: ScrambleProps) => {
  return (
    <motion.span style={{ whiteSpace: toCssWhiteSpace(whitespace) }}>
      {parseTextWithLineBreaks(children, { scrambleOnMount, underline })}
    </motion.span>
  );
};
