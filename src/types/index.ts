// Mix status progression: pending → generating → selecting → synthesizing → completed
export type MixStatus = "pending" | "generating" | "selecting" | "synthesizing" | "completed" | "failed";
export type GenerationStatus = "pending" | "generating" | "completed" | "failed";
export type SynthesisStatus = "pending" | "synthesizing" | "completed" | "failed";

export type SelectionCategory = "composition" | "colors" | "subject" | "style" | "background";

export const STYLE_VARIANTS = ["gemini", "gpt_image", "flux"] as const;
export type StyleVariant = (typeof STYLE_VARIANTS)[number];

export const STYLE_VARIANT_LABELS: Record<StyleVariant, string> = {
  gemini: "Gemini",
  gpt_image: "GPT Image",
  flux: "FLUX",
};

export const SELECTION_CATEGORIES: {
  value: SelectionCategory;
  label: string;
  description: string;
}[] = [
  { value: "composition", label: "Composition", description: "Which image has the best layout and framing?" },
  { value: "colors", label: "Color Palette", description: "Which image has the best colors and lighting?" },
  { value: "subject", label: "Subject Detail", description: "Which image captures the subject best?" },
  { value: "style", label: "Style", description: "Which image has the overall style you prefer?" },
  { value: "background", label: "Background", description: "Which image has the best background/environment?" },
];

export const MIN_SELECTIONS_REQUIRED = 3;
export const DEFAULT_CREDITS = 5;
