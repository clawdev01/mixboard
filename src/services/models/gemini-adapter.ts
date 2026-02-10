import { GoogleGenAI } from "@google/genai";
import { STYLE_PROMPTS, type StyleVariant } from "@/types";
import type {
  ModelAdapter,
  GenerationRequest,
  GenerationResult,
  SynthesisRequest,
  SynthesisResult,
} from "./types";

const MODEL_NAME = "gemini-2.5-flash-image";

export class GeminiAdapter implements ModelAdapter {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateImage(request: GenerationRequest): Promise<GenerationResult> {
    const start = Date.now();
    const styleModifier =
      STYLE_PROMPTS[request.styleVariant as StyleVariant] ?? "";
    const fullPrompt = `${request.prompt}${styleModifier}`;

    const response = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: fullPrompt,
      config: {
        responseModalities: ["IMAGE"],
      },
    });

    const imageBuffer = this.extractImage(response);
    if (!imageBuffer) {
      throw new Error(
        "Gemini did not return an image. The prompt may have been refused."
      );
    }

    return {
      imageBuffer,
      model: MODEL_NAME,
      provider: "google",
      generationTimeMs: Date.now() - start,
    };
  }

  async synthesizeImages(
    request: SynthesisRequest
  ): Promise<SynthesisResult> {
    const synthesisPrompt = this.buildSynthesisPrompt(request);

    const imageParts = request.sourceImages.map((buf) => ({
      inlineData: {
        data: buf.toString("base64"),
        mimeType: "image/webp",
      },
    }));

    const response = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [
            ...imageParts,
            { text: synthesisPrompt },
          ],
        },
      ],
      config: {
        responseModalities: ["IMAGE"],
      },
    });

    const imageBuffer = this.extractImage(response);
    if (!imageBuffer) {
      throw new Error("Gemini did not return a synthesized image.");
    }

    return {
      imageBuffer,
      synthesisPrompt,
      model: MODEL_NAME,
    };
  }

  private extractImage(response: unknown): Buffer | null {
    // Navigate the Gemini response structure to find image data
    const resp = response as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
            inlineData?: { data: string; mimeType: string };
          }>;
        };
      }>;
    };

    const parts = resp?.candidates?.[0]?.content?.parts;
    if (!parts) return null;

    const imagePart = parts.find(
      (p) => p.inlineData?.mimeType?.startsWith("image/")
    );
    if (!imagePart?.inlineData?.data) return null;

    return Buffer.from(imagePart.inlineData.data, "base64");
  }

  private buildSynthesisPrompt(request: SynthesisRequest): string {
    const categoryMap: Record<string, string> = {
      composition: "COMPOSITION and LAYOUT (spatial arrangement, camera angle, framing)",
      colors: "COLOR PALETTE and LIGHTING (colors, tones, light direction, mood)",
      subject: "SUBJECT DETAILS and TEXTURES (main subject appearance, fine details)",
      style: "ARTISTIC STYLE and RENDERING (overall artistic approach, technique)",
      background: "BACKGROUND and ENVIRONMENT (setting, context, atmosphere)",
    };

    const selectionLines = request.selections.map((s) => {
      const desc = categoryMap[s.category] || s.category;
      return `- Use the ${desc} from Image ${s.sourceIndex + 1}`;
    });

    let prompt = `You are an expert image synthesis AI. Create a single new image that combines the best elements from the reference images provided:

${selectionLines.join("\n")}

The original prompt was: "${request.originalPrompt}"

Create a cohesive, high-quality image that seamlessly blends these elements. The result should look like a single unified image, not a collage. Maintain consistency in lighting direction and perspective.`;

    if (request.additionalInstructions) {
      prompt += `\n\nAdditional instructions: ${request.additionalInstructions}`;
    }

    return prompt;
  }
}
