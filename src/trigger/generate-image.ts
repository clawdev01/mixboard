import { task, logger } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { generations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getModelAdapter } from "@/services/models";
import { uploadImage, generationKey } from "@/lib/storage/r2";

export interface GenerateImagePayload {
  generationId: string;
  mixId: string;
  prompt: string;
  styleVariant: string;
}

export interface GenerateImageOutput {
  generationId: string;
  imageUrl: string;
  generationTimeMs: number;
}

export const generateImageTask = task({
  id: "generate-image",
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: GenerateImagePayload): Promise<GenerateImageOutput> => {
    const { generationId, mixId, prompt, styleVariant } = payload;
    logger.info("Starting image generation", { generationId, styleVariant });

    // Update status to generating
    await db
      .update(generations)
      .set({ status: "generating" })
      .where(eq(generations.id, generationId));

    try {
      const adapter = getModelAdapter("google");
      const result = await adapter.generateImage({ prompt, styleVariant });

      // Upload to R2
      const key = generationKey(mixId, generationId);
      const imageUrl = await uploadImage(result.imageBuffer, key);

      // Update DB with success
      await db
        .update(generations)
        .set({
          status: "completed",
          imageUrl,
          modelName: result.model,
          modelProvider: result.provider,
          generationTimeMs: result.generationTimeMs,
        })
        .where(eq(generations.id, generationId));

      logger.info("Image generation completed", {
        generationId,
        generationTimeMs: result.generationTimeMs,
      });

      return { generationId, imageUrl, generationTimeMs: result.generationTimeMs };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      await db
        .update(generations)
        .set({ status: "failed", errorMessage: message })
        .where(eq(generations.id, generationId));

      logger.error("Image generation failed", { generationId, error: message });
      throw error;
    }
  },
});
