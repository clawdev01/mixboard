"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Share2, Plus, ThumbsUp, ThumbsDown } from "lucide-react";
import { STYLE_VARIANT_LABELS, type StyleVariant } from "@/types";
import type { Generation, SynthesisResult as SynthesisResultType } from "@/lib/db/schema";

interface SynthesisResultProps {
  synthesis: SynthesisResultType;
  generations: Generation[];
  mixId: string;
}

export function SynthesisResult({
  synthesis,
  generations,
  mixId,
}: SynthesisResultProps) {
  const [compareIndex, setCompareIndex] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const compareGen = generations[compareIndex];

  async function handleFeedback(rating: "up" | "down") {
    try {
      await fetch(`/api/mix/${mixId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      setFeedbackSent(true);
      toast.success("Thanks for your feedback!");
    } catch {
      toast.error("Failed to send feedback");
    }
  }

  async function handleDownload() {
    if (!synthesis.imageUrl) return;
    try {
      const res = await fetch(synthesis.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mixboard-${mixId}.webp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download image");
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/mix/${mixId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  }

  return (
    <div className="space-y-6">
      {/* Synthesized image */}
      <div className="relative aspect-square max-w-2xl mx-auto rounded-xl overflow-hidden border">
        {synthesis.imageUrl ? (
          <Image
            src={synthesis.imageUrl}
            alt="Synthesized mix"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Synthesis result unavailable</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={handleDownload} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button onClick={handleShare} variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Copy Link
        </Button>
        <Button asChild>
          <Link href="/">
            <Plus className="mr-2 h-4 w-4" />
            New Mix
          </Link>
        </Button>
      </div>

      {/* Feedback */}
      {!feedbackSent && (
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground">
            How was this mix?
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleFeedback("up")}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleFeedback("down")}
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Compare slider */}
      {synthesis.imageUrl && compareGen?.imageUrl && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Compare with originals</h3>
            <div className="flex gap-2">
              {generations.map((gen, i) => {
                const label =
                  STYLE_VARIANT_LABELS[gen.styleVariant as StyleVariant] ??
                  gen.styleVariant;
                return (
                  <button
                    key={gen.id}
                    onClick={() => setCompareIndex(i)}
                    className={`text-xs ${
                      i === compareIndex
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="max-w-2xl mx-auto rounded-xl overflow-hidden border">
            <ReactCompareSlider
              itemOne={
                <ReactCompareSliderImage
                  src={compareGen.imageUrl}
                  alt="Original"
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src={synthesis.imageUrl}
                  alt="Mix result"
                />
              }
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground max-w-2xl mx-auto">
            <span>
              Original ({STYLE_VARIANT_LABELS[compareGen.styleVariant as StyleVariant]})
            </span>
            <span>Mix Result</span>
          </div>
        </div>
      )}

      {/* Source thumbnails */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Source images</h3>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          {generations.map((gen) => (
            <div
              key={gen.id}
              className="relative aspect-square rounded-lg overflow-hidden border"
            >
              {gen.imageUrl && (
                <Image
                  src={gen.imageUrl}
                  alt={gen.styleVariant}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              )}
              <Badge
                variant="secondary"
                className="absolute bottom-1 left-1 text-[10px] font-mono backdrop-blur-sm bg-background/80 px-1.5 py-0"
              >
                {STYLE_VARIANT_LABELS[gen.styleVariant as StyleVariant]}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
