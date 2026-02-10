import { db } from "@/lib/db";
import {
  mixes,
  generations,
  selections,
  synthesisResults,
  type Mix,
  type Generation,
  type Selection,
  type SynthesisResult,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { MixStatus } from "@/types";

export interface MixWithDetails {
  mix: Mix;
  generations: Generation[];
  selections: Selection[];
  synthesis: SynthesisResult | null;
}

export async function getMixWithDetails(
  mixId: string
): Promise<MixWithDetails | null> {
  const [mix] = await db
    .select()
    .from(mixes)
    .where(eq(mixes.id, mixId))
    .limit(1);

  if (!mix) return null;

  const [gens, sels, synths] = await Promise.all([
    db.select().from(generations).where(eq(generations.mixId, mixId)),
    db.select().from(selections).where(eq(selections.mixId, mixId)),
    db.select().from(synthesisResults).where(eq(synthesisResults.mixId, mixId)),
  ]);

  return {
    mix,
    generations: gens,
    selections: sels,
    synthesis: synths[0] ?? null,
  };
}

export async function getMixesByUser(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Mix[]> {
  return db
    .select()
    .from(mixes)
    .where(eq(mixes.userId, userId))
    .orderBy(desc(mixes.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateMixStatus(
  mixId: string,
  status: MixStatus
): Promise<void> {
  await db
    .update(mixes)
    .set({ status, updatedAt: new Date() })
    .where(eq(mixes.id, mixId));
}

export async function setMixTriggerRunId(
  mixId: string,
  triggerRunId: string
): Promise<void> {
  await db
    .update(mixes)
    .set({ triggerRunId, updatedAt: new Date() })
    .where(eq(mixes.id, mixId));
}
