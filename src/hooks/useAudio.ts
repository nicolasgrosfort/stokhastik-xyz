import { create } from "zustand";

type AudioState = {
  enabled: boolean;
  sources: number;
  setEnabled: (enabled: boolean) => void;
  registerSource: () => () => void;
};

export const useAudio = create<AudioState>()((set) => ({
  enabled: false,
  sources: 0,
  setEnabled: (enabled) => set({ enabled }),
  registerSource: () => {
    set((state) => ({ sources: state.sources + 1 }));
    return () => set((state) => ({ sources: state.sources - 1 }));
  },
}));
