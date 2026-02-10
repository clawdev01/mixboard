import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserByEmail } from "@/lib/db/queries/users";
import { getMixesByUser } from "@/lib/db/queries/mixes";
import { MixHistory } from "@/components/features/dashboard/mix-history";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
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

  const mixes = await getMixesByUser(dbUser.id);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Mixes</h1>
          <p className="mt-1 text-muted-foreground">
            {mixes.length} mix{mixes.length !== 1 ? "es" : ""} created
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <Plus className="mr-2 h-4 w-4" />
            New Mix
          </Link>
        </Button>
      </div>

      <MixHistory mixes={mixes} />
    </main>
  );
}
