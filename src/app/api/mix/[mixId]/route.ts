import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserByEmail } from "@/lib/db/queries/users";
import { getMixWithDetails } from "@/lib/db/queries/mixes";

export async function GET(
  _request: NextRequest,
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

  // Fetch mix with all related data
  const data = await getMixWithDetails(mixId);
  if (!data) {
    return NextResponse.json({ error: "Mix not found" }, { status: 404 });
  }

  // Ownership check
  if (data.mix.userId !== dbUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(data);
}
