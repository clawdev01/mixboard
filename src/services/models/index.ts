import { GeminiAdapter } from "./gemini-adapter";
import { OpenAIAdapter } from "./openai-adapter";
import { FluxAdapter } from "./flux-adapter";
import type { ModelAdapter } from "./types";

export function getModelAdapter(provider: string = "google"): ModelAdapter {
  switch (provider) {
    case "google":
      return new GeminiAdapter(process.env.GEMINI_API_KEY!);
    case "openai":
      return new OpenAIAdapter(process.env.OPENAI_API_KEY!);
    case "huggingface":
      return new FluxAdapter(process.env.HF_API_TOKEN!);
    default:
      throw new Error(`Unknown model provider: ${provider}`);
  }
}

export type { ModelAdapter, GenerationRequest, GenerationResult, SynthesisRequest, SynthesisResult } from "./types";
