import { task, logger } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { mixes, generations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { STYLE_VARIANTS } from "@/types";
import { generateImageTask } from "./generate-image";
import { refundCredit } from "@/lib/db/queries/users";

export interface GenerateMixPayload {
  mixId: string;
  userId: string;
  prompt: string;
}

export interface GenerateMixOutput {
  mixId: string;
  status: "selecting" | "failed";
  completedCount: number;
  failedCount: number;
}

export const generateMixTask = task({
  id: "generate-mix",
  run: async (payload: GenerateMixPayload): Promise<GenerateMixOutput> => {
    const { mixId, userId, prompt } = payload;
    logger.info("Starting mix generation", { mixId, prompt });

    // Update mix status to generating
    await db
      .update(mixes)
      .set({ status: "generating", updatedAt: new Date() })
      .where(eq(mixes.id, mixId));

    // Create 3 generation records (one per style variant)
    const genRecords = await Promise.all(
      STYLE_VARIANTS.map((style) =>
        db
          .insert(generations)
          .values({
            mixId,
            modelName: "gemini-2.5-flash-image",
            modelProvider: "google",
            styleVariant: style,
            status: "pending",
          })
          .returning()
      )
    );

    // Fan out 3 parallel generation tasks
    const results = await generateImageTask.batchTriggerAndWait(
      genRecords.map(([gen]) => ({
        payload: {
          generationId: gen.id,
          mixId,
          prompt,
          styleVariant: gen.styleVariant,
        },
      }))
    );

    // Count successes/failures
    let completedCount = 0;
    let failedCount = 0;
    for (const result of results.runs) {
      if (result.ok) {
        completedCount++;
      } else {
        failedCount++;
      }
    }

    // If all 3 failed, refund the credit and mark mix as failed
    if (completedCount === 0) {
      await refundCredit(userId);
      await db
        .update(mixes)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(mixes.id, mixId));

      logger.error("All generations failed, credit refunded", { mixId });
      return { mixId, status: "failed", completedCount, failedCount };
    }

    // At least 1 succeeded — move to selecting
    await db
      .update(mixes)
      .set({ status: "selecting", updatedAt: new Date() })
      .where(eq(mixes.id, mixId));

    logger.info("Mix generation completed", { mixId, completedCount, failedCount });
    return { mixId, status: "selecting", completedCount, failedCount };
  },
});
