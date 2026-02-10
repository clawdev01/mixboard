import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserByEmail } from "@/lib/db/queries/users";
import { HeaderActions } from "./header-actions";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let credits: number | null = null;
  if (user?.email) {
    const dbUser = await getUserByEmail(user.email);
    credits = dbUser?.creditsRemaining ?? null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 mx-auto max-w-6xl">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg tracking-tight">
            MixBoard
          </Link>
          {user && (
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          )}
        </div>

        <HeaderActions
          isAuthenticated={!!user}
          email={user?.email ?? null}
          credits={credits}
        />
      </div>
    </header>
  );
}
