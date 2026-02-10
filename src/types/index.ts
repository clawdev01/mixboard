// Mix status progression: pending → generating → selecting → synthesizing → completed
export type MixStatus = "pending" | "generating" | "selecting" | "synthesizing" | "completed" | "failed";
export type GenerationStatus = "pending" | "generating" | "completed" | "failed";
export type SynthesisStatus = "pending" | "synthesizing" | "completed" | "failed";

export type SelectionCategory = "composition" | "colors" | "subject" | "style" | "background";

export const STYLE_VARIANTS = ["photorealistic", "digital_art", "cinematic"] as const;
export type StyleVariant = (typeof STYLE_VARIANTS)[number];

export const STYLE_VARIANT_LABELS: Record<StyleVariant, string> = {
  photorealistic: "Photorealistic",
  digital_art: "Digital Art",
  cinematic: "Cinematic",
};

export const STYLE_PROMPTS: Record<StyleVariant, string> = {
  photorealistic: ", photorealistic, high detail, natural lighting, DSLR photo quality",
  digital_art: ", digital art style, vibrant colors, stylized, illustration quality, concept art",
  cinematic: ", cinematic composition, dramatic lighting, film still, movie scene, wide angle",
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
