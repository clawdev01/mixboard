import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { mixes, synthesisResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUserByEmail } from "@/lib/db/queries/users";
import { getMixWithDetails } from "@/lib/db/queries/mixes";
import { createSelections } from "@/lib/db/queries/selections";
import { synthesizeImageTask } from "@/trigger/synthesize-image";
import { z } from "zod/v4";
import { MIN_SELECTIONS_REQUIRED } from "@/types";

const selectionsSchema = z.object({
  selections: z
    .array(
      z.object({
        category: z.string(),
        generationId: z.string().uuid(),
      })
    )
    .min(MIN_SELECTIONS_REQUIRED, `At least ${MIN_SELECTIONS_REQUIRED} selections required`),
  additionalInstructions: z.string().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mixId: string }> }
) {
  const { mixId } = await params;

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await getUserByEmail(user.email);
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Verify mix exists and belongs to user
  const mixData = await getMixWithDetails(mixId);
  if (!mixData) {
    return NextResponse.json({ error: "Mix not found" }, { status: 404 });
  }
  if (mixData.mix.userId !== dbUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (mixData.mix.status !== "selecting") {
    return NextResponse.json(
      { error: "Mix is not in selecting state" },
      { status: 400 }
    );
  }

  // Validate input
  const body = await request.json();
  const parsed = selectionsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid selections", details: parsed.error.issues },
      { status: 400 }
    );
  }

  // Save selections
  await createSelections(mixId, parsed.data.selections);

  // Create synthesis record
  const [synthesis] = await db
    .insert(synthesisResults)
    .values({
      mixId,
      synthesisPrompt: "", // Will be set by the task
      synthesisModel: "gemini-2.0-flash-preview-image-generation",
      status: "pending",
    })
    .returning();

  // Update mix status
  await db
    .update(mixes)
    .set({ status: "synthesizing", updatedAt: new Date() })
    .where(eq(mixes.id, mixId));

  // Trigger synthesis
  const handle = await synthesizeImageTask.trigger({
    mixId,
    synthesisId: synthesis.id,
    additionalInstructions: parsed.data.additionalInstructions,
  });

  return NextResponse.json({
    synthesisId: synthesis.id,
    runId: handle.id,
    publicAccessToken: handle.publicAccessToken,
  });
}
