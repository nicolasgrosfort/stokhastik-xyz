import { create } from "zustand";

type StoreFiltersState = {
  modelUrl: string | null;
  setModelUrl: (modelUrl: string) => void;
};

export const useStoreModel = create<StoreFiltersState>()((set) => ({
  modelUrl: null,
  setModelUrl: (modelUrl) => set({ modelUrl }),
}));
