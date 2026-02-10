import { db } from "@/lib/db";
import { selections, type NewSelection, type Selection } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createSelections(
  mixId: string,
  items: { category: string; generationId: string }[]
): Promise<Selection[]> {
  const values: NewSelection[] = items.map((item) => ({
    mixId,
    category: item.category,
    generationId: item.generationId,
  }));

  return db.insert(selections).values(values).returning();
}

export async function getSelectionsByMix(
  mixId: string
): Promise<Selection[]> {
  return db.select().from(selections).where(eq(selections.mixId, mixId));
}
