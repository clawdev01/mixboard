"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Check } from "lucide-react";
import {
  SELECTION_CATEGORIES,
  MIN_SELECTIONS_REQUIRED,
  STYLE_VARIANT_LABELS,
  type SelectionCategory,
  type StyleVariant,
} from "@/types";
import type { Generation } from "@/lib/db/schema";

interface SelectionPanelProps {
  mixId: string;
  generations: Generation[];
  onSynthesisStarted: () => void;
}

export function SelectionPanel({
  mixId,
  generations,
  onSynthesisStarted,
}: SelectionPanelProps) {
  const [selections, setSelections] = useState<
    Partial<Record<SelectionCategory, string>>
  >({});
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectionCount = Object.keys(selections).length;
  const canSubmit = selectionCount >= MIN_SELECTIONS_REQUIRED && !submitting;

  function handleSelect(category: SelectionCategory, generationId: string) {
    setSelections((prev) => {
      // Toggle off if already selected
      if (prev[category] === generationId) {
        const { [category]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [category]: generationId };
    });
  }

  async function handleSubmit() {
    setSubmitting(true);

    const selectionArray = Object.entries(selections).map(
      ([category, generationId]) => ({ category, generationId })
    );

    try {
      const res = await fetch(`/api/mix/${mixId}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selections: selectionArray,
          additionalInstructions: additionalInstructions || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to submit selections");
        setSubmitting(false);
        return;
      }

      toast.success("Synthesizing your mix...");
      onSynthesisStarted();
    } catch {
      toast.error("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 border-t pt-6">
      <div>
        <h2 className="text-xl font-semibold">Select your favorite elements</h2>
        <p className="text-sm text-muted-foreground mt-1">
          For each category, choose which image has the best version. Select at
          least {MIN_SELECTIONS_REQUIRED} categories.
        </p>
      </div>

      <div className="space-y-4">
        {SELECTION_CATEGORIES.map((category) => (
          <CategoryRow
            key={category.value}
            category={category}
            generations={generations}
            selectedId={selections[category.value]}
            onSelect={(genId) => handleSelect(category.value, genId)}
          />
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions" className="text-sm">
          Additional instructions (optional)
        </Label>
        <Input
          id="instructions"
          placeholder="e.g., Make it warmer, add more contrast..."
          value={additionalInstructions}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
          maxLength={500}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectionCount}/{SELECTION_CATEGORIES.length} categories selected
          {selectionCount < MIN_SELECTIONS_REQUIRED && (
            <span className="text-destructive">
              {" "}
              (need {MIN_SELECTIONS_REQUIRED - selectionCount} more)
            </span>
          )}
        </p>
        <Button onClick={handleSubmit} disabled={!canSubmit} size="lg">
          <Sparkles className="mr-2 h-4 w-4" />
          {submitting ? "Creating mix..." : "Create Mix"}
        </Button>
      </div>
    </div>
  );
}

interface CategoryRowProps {
  category: { value: SelectionCategory; label: string; description: string };
  generations: Generation[];
  selectedId: string | undefined;
  onSelect: (generationId: string) => void;
}

function CategoryRow({
  category,
  generations,
  selectedId,
  onSelect,
}: CategoryRowProps) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div>
        <h3 className="font-medium text-sm">{category.label}</h3>
        <p className="text-xs text-muted-foreground">{category.description}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {generations.map((gen) => {
          const isSelected = selectedId === gen.id;
          const label =
            STYLE_VARIANT_LABELS[gen.styleVariant as StyleVariant] ??
            gen.styleVariant;

          return (
            <button
              key={gen.id}
              onClick={() => onSelect(gen.id)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                isSelected
                  ? "border-primary ring-2 ring-primary/30 shadow-md"
                  : "border-transparent hover:border-muted-foreground/30"
              }`}
            >
              {gen.imageUrl && (
                <Image
                  src={gen.imageUrl}
                  alt={label}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              )}
              {isSelected && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="rounded-full bg-primary p-1">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
              <Badge
                variant="secondary"
                className="absolute bottom-1 left-1 text-[10px] font-mono backdrop-blur-sm bg-background/80 px-1.5 py-0"
              >
                {label}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
