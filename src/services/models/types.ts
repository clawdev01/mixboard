export interface GenerationRequest {
  prompt: string;
}

export interface GenerationResult {
  imageBuffer: Buffer;
  model: string;
  provider: string;
  generationTimeMs: number;
}

export interface SynthesisRequest {
  sourceImages: Buffer[];
  selections: { category: string; sourceIndex: number }[];
  originalPrompt: string;
  additionalInstructions?: string;
}

export interface SynthesisResult {
  imageBuffer: Buffer;
  synthesisPrompt: string;
  model: string;
}

export interface ModelAdapter {
  generateImage(request: GenerationRequest): Promise<GenerationResult>;
  synthesizeImages(request: SynthesisRequest): Promise<SynthesisResult>;
}
