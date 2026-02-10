import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { mixes } from "@/lib/db/schema";
import { getUserByEmail, deductCredit, upsertUser } from "@/lib/db/queries/users";
import { setMixTriggerRunId } from "@/lib/db/queries/mixes";
import { generateMixTask } from "@/trigger/generate-mix";
import { z } from "zod/v4";

const createMixSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters").max(1000, "Prompt must be under 1000 characters"),
});

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate input
  const body = await request.json();
  const parsed = createMixSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid prompt", details: parsed.error.issues },
      { status: 400 }
    );
  }

  // Get or create user
  const dbUser = await upsertUser(user.email);

  // Check credits
  if (dbUser.creditsRemaining <= 0) {
    return NextResponse.json(
      { error: "No credits remaining. Purchase more to continue." },
      { status: 403 }
    );
  }

  // Deduct credit
  const deducted = await deductCredit(dbUser.id);
  if (!deducted) {
    return NextResponse.json(
      { error: "Failed to deduct credit" },
      { status: 500 }
    );
  }

  // Create mix record
  const [mix] = await db
    .insert(mixes)
    .values({
      userId: dbUser.id,
      prompt: parsed.data.prompt,
      status: "pending",
    })
    .returning();

  // Trigger background generation
  const handle = await generateMixTask.trigger({
    mixId: mix.id,
    userId: dbUser.id,
    prompt: parsed.data.prompt,
  });

  // Store run ID for realtime subscription
  await setMixTriggerRunId(mix.id, handle.id);

  return NextResponse.json({
    mixId: mix.id,
    runId: handle.id,
    publicAccessToken: handle.publicAccessToken,
  });
}
