"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { STYLE_VARIANT_LABELS, type StyleVariant } from "@/types";
import { AlertCircle, Clock } from "lucide-react";

interface ImageCardProps {
  imageUrl: string | null;
  styleVariant: string;
  status: string;
  errorMessage?: string | null;
  generationTimeMs?: number | null;
  onClick?: () => void;
  selected?: boolean;
}

export function ImageCard({
  imageUrl,
  styleVariant,
  status,
  errorMessage,
  generationTimeMs,
  onClick,
  selected,
}: ImageCardProps) {
  const label =
    STYLE_VARIANT_LABELS[styleVariant as StyleVariant] ?? styleVariant;

  if (status === "pending" || status === "generating") {
    return (
      <div className="relative aspect-square rounded-xl border bg-muted/50 overflow-hidden">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs text-muted-foreground font-mono">
            {status === "pending" ? "Queued..." : "Generating..."}
          </span>
        </div>
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 font-mono text-xs"
        >
          {label}
        </Badge>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="relative aspect-square rounded-xl border bg-destructive/10 overflow-hidden flex flex-col items-center justify-center gap-2 p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <span className="text-xs text-destructive text-center">
          {errorMessage || "Generation failed"}
        </span>
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 font-mono text-xs"
        >
          {label}
        </Badge>
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-square rounded-xl border overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
        selected ? "ring-2 ring-primary shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={`${label} generation`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      )}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <Badge variant="secondary" className="font-mono text-xs backdrop-blur-sm bg-background/80">
          {label}
        </Badge>
      </div>
      {generationTimeMs && (
        <div className="absolute bottom-3 right-3">
          <Badge variant="outline" className="font-mono text-xs backdrop-blur-sm bg-background/80 gap-1">
            <Clock className="h-3 w-3" />
            {(generationTimeMs / 1000).toFixed(1)}s
          </Badge>
        </div>
      )}
    </div>
  );
}
