import type {
  ModelAdapter,
  GenerationRequest,
  GenerationResult,
  SynthesisRequest,
  SynthesisResult,
} from "./types";

const MODEL_NAME = "FLUX.1-schnell";
const API_URL =
  "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";

export class FluxAdapter implements ModelAdapter {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async generateImage(request: GenerationRequest): Promise<GenerationResult> {
    const start = Date.now();

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: request.prompt }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`FLUX API error (${response.status}): ${text}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    if (imageBuffer.length === 0) {
      throw new Error("FLUX returned an empty image.");
    }

    return {
      imageBuffer,
      model: MODEL_NAME,
      provider: "huggingface",
      generationTimeMs: Date.now() - start,
    };
  }

  async synthesizeImages(_request: SynthesisRequest): Promise<SynthesisResult> {
    throw new Error("Synthesis is not supported by FLUX adapter. Use Gemini.");
  }
}
