"use client";

import { ImageCard } from "./image-card";
import type { Generation } from "@/lib/db/schema";

interface GenerationGridProps {
  generations: Generation[];
}

export function GenerationGrid({ generations }: GenerationGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {generations.map((gen) => (
        <ImageCard
          key={gen.id}
          imageUrl={gen.imageUrl}
          styleVariant={gen.styleVariant}
          status={gen.status}
          errorMessage={gen.errorMessage}
          generationTimeMs={gen.generationTimeMs}
        />
      ))}
    </div>
  );
}
