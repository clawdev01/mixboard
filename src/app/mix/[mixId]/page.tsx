import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getUserByEmail } from "@/lib/db/queries/users";
import { getMixWithDetails } from "@/lib/db/queries/mixes";
import { MixWorkspace } from "@/components/features/mix/mix-workspace";

interface MixPageProps {
  params: Promise<{ mixId: string }>;
}

export default async function MixPage({ params }: MixPageProps) {
  const { mixId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const dbUser = await getUserByEmail(user.email);
  if (!dbUser) {
    redirect("/login");
  }

  const data = await getMixWithDetails(mixId);
  if (!data) {
    notFound();
  }

  // Ownership check
  if (data.mix.userId !== dbUser.id) {
    notFound();
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <MixWorkspace initialData={data} />
    </main>
  );
}
