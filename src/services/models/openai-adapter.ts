import OpenAI from "openai";
import type {
  ModelAdapter,
  GenerationRequest,
  GenerationResult,
  SynthesisRequest,
  SynthesisResult,
} from "./types";

const MODEL_NAME = "gpt-image-1";

export class OpenAIAdapter implements ModelAdapter {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateImage(request: GenerationRequest): Promise<GenerationResult> {
    const start = Date.now();

    const response = await this.client.images.generate({
      model: MODEL_NAME,
      prompt: request.prompt,
      quality: "low",
      size: "1024x1024",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error("OpenAI did not return an image.");
    }

    return {
      imageBuffer: Buffer.from(b64, "base64"),
      model: MODEL_NAME,
      provider: "openai",
      generationTimeMs: Date.now() - start,
    };
  }

  async synthesizeImages(_request: SynthesisRequest): Promise<SynthesisResult> {
    throw new Error("Synthesis is not supported by OpenAI adapter. Use Gemini.");
  }
}
