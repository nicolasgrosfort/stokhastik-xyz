import { create } from "zustand";

type AudioState = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

export const useAudio = create<AudioState>()((set) => ({
  enabled: false,
  setEnabled: (enabled) => set({ enabled }),
}));
