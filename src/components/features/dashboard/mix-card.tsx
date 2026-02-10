"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Mix } from "@/lib/db/schema";
import type { MixStatus } from "@/types";

interface MixCardProps {
  mix: Mix;
}

const STATUS_STYLES: Record<
  MixStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Starting", variant: "secondary" },
  generating: { label: "Generating", variant: "default" },
  selecting: { label: "Selecting", variant: "outline" },
  synthesizing: { label: "Synthesizing", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  failed: { label: "Failed", variant: "destructive" },
};

export function MixCard({ mix }: MixCardProps) {
  const status = mix.status as MixStatus;
  const { label, variant } = STATUS_STYLES[status] ?? {
    label: status,
    variant: "secondary" as const,
  };

  const timeAgo = getTimeAgo(mix.createdAt);

  return (
    <Link href={`/mix/${mix.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Badge variant={variant} className="font-mono text-xs shrink-0">
              {label}
            </Badge>
            <span className="text-xs text-muted-foreground shrink-0">
              {timeAgo}
            </span>
          </div>
          <p className="text-sm line-clamp-3 leading-relaxed">
            {mix.prompt}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}
