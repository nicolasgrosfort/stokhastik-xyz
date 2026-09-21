"use client";

import { useAudio } from "@/hooks/useAudio";
import { Toggle } from "@base-ui/react";
import { AudioContext as ThreeAudioContext } from "three";

export const AudioToggle = () => {
  const enabled = useAudio((state) => state.enabled);
  const setEnabled = useAudio((state) => state.setEnabled);
  const hasSources = useAudio((state) => state.sources > 0);

  if (!hasSources) return null;

  return (
    <Toggle
      pressed={enabled}
      onPressedChange={(pressed) => {
        // Browsers keep the audio context suspended until a user gesture, and
        // this click is one.
        if (pressed) {
          const context =
            ThreeAudioContext.getContext() as unknown as globalThis.AudioContext;
          if (context.state === "suspended") context.resume();
        }
        setEnabled(pressed);
      }}
      aria-label="Son"
      className="fixed right-3 bottom-12 z-50 border border-foreground bg-background px-2 py-0.5 font-mono text-[10px] uppercase text-foreground cursor-pointer data-pressed:bg-foreground data-pressed:text-background sm:text-xs"
    >
      Son {enabled ? "on" : "off"}
    </Toggle>
  );
};
