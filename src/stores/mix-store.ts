import { create } from "zustand";
import type { SelectionCategory } from "@/types";

interface MixState {
  mixId: string | null;
  runId: string | null;

  // Selection state: category → generationId
  selections: Partial<Record<SelectionCategory, string>>;
  additionalInstructions: string;

  // Actions
  setMixContext: (mixId: string, runId: string) => void;
  setSelection: (category: SelectionCategory, generationId: string) => void;
  removeSelection: (category: SelectionCategory) => void;
  setAdditionalInstructions: (instructions: string) => void;
  clearSelections: () => void;
  reset: () => void;
}

export const useMixStore = create<MixState>((set) => ({
  mixId: null,
  runId: null,
  selections: {},
  additionalInstructions: "",

  setMixContext: (mixId, runId) =>
    set({ mixId, runId }),

  setSelection: (category, generationId) =>
    set((state) => ({
      selections: { ...state.selections, [category]: generationId },
    })),

  removeSelection: (category) =>
    set((state) => {
      const { [category]: _, ...rest } = state.selections;
      return { selections: rest };
    }),

  setAdditionalInstructions: (instructions) =>
    set({ additionalInstructions: instructions }),

  clearSelections: () => set({ selections: {}, additionalInstructions: "" }),

  reset: () =>
    set({
      mixId: null,
      runId: null,
      selections: {},
      additionalInstructions: "",
    }),
}));
