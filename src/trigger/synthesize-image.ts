import { task, logger } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { mixes, generations, selections, synthesisResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getModelAdapter } from "@/services/models";
import {
  uploadImage,
  downloadImage,
  synthesisKey,
} from "@/lib/storage/r2";
import { STYLE_VARIANTS } from "@/types";

export interface SynthesizeImagePayload {
  mixId: string;
  synthesisId: string;
  additionalInstructions?: string;
}

export interface SynthesizeImageOutput {
  mixId: string;
  imageUrl: string;
}

export const synthesizeImageTask = task({
  id: "synthesize-image",
  retry: {
    maxAttempts: 2,
  },
  run: async (
    payload: SynthesizeImagePayload
  ): Promise<SynthesizeImageOutput> => {
    const { mixId, synthesisId, additionalInstructions } = payload;
    logger.info("Starting synthesis", { mixId, synthesisId });

    // Update synthesis status
    await db
      .update(synthesisResults)
      .set({ status: "synthesizing" })
      .where(eq(synthesisResults.id, synthesisId));

    await db
      .update(mixes)
      .set({ status: "synthesizing", updatedAt: new Date() })
      .where(eq(mixes.id, mixId));

    try {
      // Fetch the mix data
      const [mix] = await db
        .select()
        .from(mixes)
        .where(eq(mixes.id, mixId))
        .limit(1);

      // Fetch all completed generations for this mix
      const gens = await db
        .select()
        .from(generations)
        .where(eq(generations.mixId, mixId));

      const completedGens = gens.filter(
        (g) => g.status === "completed" && g.imageUrl
      );

      // Sort by style variant order to maintain consistent indexing
      completedGens.sort(
        (a, b) =>
          STYLE_VARIANTS.indexOf(a.styleVariant as (typeof STYLE_VARIANTS)[number]) -
          STYLE_VARIANTS.indexOf(b.styleVariant as (typeof STYLE_VARIANTS)[number])
      );

      // Fetch selections
      const sels = await db
        .select()
        .from(selections)
        .where(eq(selections.mixId, mixId));

      // Download all source images from R2 by key
      const sourceImages = await Promise.all(
        completedGens.map((g) => downloadImage(g.imageUrl!))
      );

      // Map selections to source indices
      const genIdToIndex = new Map(
        completedGens.map((g, i) => [g.id, i])
      );

      const selectionMappings = sels.map((s) => ({
        category: s.category,
        sourceIndex: genIdToIndex.get(s.generationId) ?? 0,
      }));

      // Call the synthesis adapter
      const adapter = getModelAdapter("google");
      const result = await adapter.synthesizeImages({
        sourceImages,
        selections: selectionMappings,
        originalPrompt: mix.prompt,
        additionalInstructions,
      });

      // Upload synthesized image to R2
      const key = synthesisKey(mixId);
      const imageUrl = await uploadImage(result.imageBuffer, key);

      // Update synthesis record
      await db
        .update(synthesisResults)
        .set({
          status: "completed",
          imageUrl,
          synthesisPrompt: result.synthesisPrompt,
          synthesisModel: result.model,
        })
        .where(eq(synthesisResults.id, synthesisId));

      // Update mix status to completed
      await db
        .update(mixes)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(mixes.id, mixId));

      logger.info("Synthesis completed", { mixId, imageUrl });
      return { mixId, imageUrl };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      await db
        .update(synthesisResults)
        .set({ status: "failed", errorMessage: message })
        .where(eq(synthesisResults.id, synthesisId));

      await db
        .update(mixes)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(mixes.id, mixId));

      logger.error("Synthesis failed", { mixId, error: message });
      throw error;
    }
  },
});
