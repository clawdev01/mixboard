"use client";

import { MixCard } from "./mix-card";
import type { Mix } from "@/lib/db/schema";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MixHistoryProps {
  mixes: Mix[];
}

export function MixHistory({ mixes }: MixHistoryProps) {
  if (mixes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Sparkles className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground text-center">
          No mixes yet. Create your first one!
        </p>
        <Button asChild>
          <Link href="/">Get started</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mixes.map((mix) => (
        <MixCard key={mix.id} mix={mix} />
      ))}
    </div>
  );
}
