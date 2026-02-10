import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getUserByEmail } from "@/lib/db/queries/users";
import { getMixWithDetails } from "@/lib/db/queries/mixes";
import { getImageSignedUrl } from "@/lib/storage/r2";
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

  // Convert R2 keys to signed URLs for initial render
  const generations = await Promise.all(
    data.generations.map(async (gen) => ({
      ...gen,
      imageUrl: gen.imageUrl ? await getImageSignedUrl(gen.imageUrl) : null,
    }))
  );

  const synthesis = data.synthesis
    ? {
        ...data.synthesis,
        imageUrl: data.synthesis.imageUrl
          ? await getImageSignedUrl(data.synthesis.imageUrl)
          : null,
      }
    : null;

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <MixWorkspace
        initialData={{
          ...data,
          generations,
          synthesis,
        }}
      />
    </main>
  );
}
