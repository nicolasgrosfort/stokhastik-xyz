"use client";

import { useAudio } from "@/hooks/useAudio";
import { Toggle, Toolbar } from "@base-ui/react";
import { AudioContext as ThreeAudioContext } from "three";

export const AudioToggle = () => {
  const enabled = useAudio((state) => state.enabled);
  const setEnabled = useAudio((state) => state.setEnabled);

  return (
    <Toolbar.Button
      render={
        <Toggle
          pressed={enabled}
          onPressedChange={(pressed) => {
            // Browsers keep the audio context suspended until a user gesture,
            // and this click is one.
            if (pressed) {
              const context =
                ThreeAudioContext.getContext() as unknown as globalThis.AudioContext;
              if (context.state === "suspended") context.resume();
            }
            setEnabled(pressed);
          }}
        />
      }
      aria-label="Son"
      className="cursor-pointer px-2 py-0.5 uppercase data-pressed:bg-foreground data-pressed:text-background"
    >
      Son
    </Toolbar.Button>
  );
};
