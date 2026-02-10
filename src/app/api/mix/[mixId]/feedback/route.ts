import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const feedbackSchema = z.object({
  rating: z.enum(["up", "down"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mixId: string }> }
) {
  const { mixId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  }

  // For MVP, just log the feedback. Future: store in a feedback table
  console.log(`Feedback for mix ${mixId}: ${parsed.data.rating} by ${user.email}`);

  return NextResponse.json({ success: true });
}
