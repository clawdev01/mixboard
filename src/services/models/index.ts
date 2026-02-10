import { GeminiAdapter } from "./gemini-adapter";
import type { ModelAdapter } from "./types";

export function getModelAdapter(provider: string = "google"): ModelAdapter {
  switch (provider) {
    case "google":
      return new GeminiAdapter(process.env.GEMINI_API_KEY!);
    // Future adapters:
    // case "fal": return new FluxAdapter(process.env.FAL_API_KEY!);
    // case "ideogram": return new IdeogramAdapter(process.env.IDEOGRAM_API_KEY!);
    default:
      throw new Error(`Unknown model provider: ${provider}`);
  }
}

export type { ModelAdapter, GenerationRequest, GenerationResult, SynthesisRequest, SynthesisResult } from "./types";
