"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GenerationGrid } from "./generation-grid";
import { SelectionPanel } from "./selection-panel";
import { SynthesisResult } from "./synthesis-result";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { MixWithDetails } from "@/lib/db/queries/mixes";
import type { MixStatus } from "@/types";

interface MixWorkspaceProps {
  initialData: MixWithDetails;
}

export function MixWorkspace({ initialData }: MixWorkspaceProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [polling, setPolling] = useState(
    initialData.mix.status === "generating" ||
    initialData.mix.status === "pending" ||
    initialData.mix.status === "synthesizing"
  );

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch(`/api/mix/${data.mix.id}`);
      if (!res.ok) return;
      const updated: MixWithDetails = await res.json();
      setData(updated);

      // Stop polling when we reach a terminal state
      if (
        updated.mix.status === "selecting" ||
        updated.mix.status === "completed" ||
        updated.mix.status === "failed"
      ) {
        setPolling(false);
        if (updated.mix.status === "selecting") {
          toast.success("All images ready! Select your favorite elements.");
        } else if (updated.mix.status === "completed") {
          toast.success("Mix complete!");
        } else if (updated.mix.status === "failed") {
          toast.error("Mix generation failed.");
        }
      }
    } catch {
      // Silently retry on network errors
    }
  }, [data.mix.id]);

  // Poll for updates during active states
  useEffect(() => {
    if (!polling) return;

    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, [polling, refreshData]);

  const handleSynthesisStarted = () => {
    setPolling(true);
    refreshData();
  };

  const status = data.mix.status as MixStatus;

  return (
    <div className="space-y-6">
      {/* Prompt display */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-medium leading-relaxed">
            &ldquo;{data.mix.prompt}&rdquo;
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* State-dependent content */}
      {(status === "pending" || status === "generating") && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generating {data.generations.length > 0 ? `${data.generations.filter((g) => g.status === "completed").length}/${data.generations.length}` : ""} images...
          </p>
          <GenerationGrid
            generations={
              data.generations.length > 0
                ? data.generations
                : // Show placeholder cards while records aren't created yet
                  Array.from({ length: 3 }, (_, i) => ({
                    id: `placeholder-${i}`,
                    mixId: data.mix.id,
                    modelName: "",
                    modelProvider: "",
                    styleVariant: ["photorealistic", "digital_art", "cinematic"][i],
                    imageUrl: null,
                    status: "pending" as const,
                    errorMessage: null,
                    generationTimeMs: null,
                    createdAt: new Date(),
                  }))
            }
          />
        </div>
      )}

      {status === "selecting" && (
        <div className="space-y-6">
          <GenerationGrid generations={data.generations} />
          <SelectionPanel
            mixId={data.mix.id}
            generations={data.generations.filter(
              (g) => g.status === "completed"
            )}
            onSynthesisStarted={handleSynthesisStarted}
          />
        </div>
      )}

      {status === "synthesizing" && (
        <div className="space-y-6">
          <GenerationGrid generations={data.generations} />
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">
              Synthesizing your mix...
            </p>
            <Skeleton className="h-64 w-full max-w-lg rounded-xl" />
          </div>
        </div>
      )}

      {status === "completed" && data.synthesis && (
        <SynthesisResult
          synthesis={data.synthesis}
          generations={data.generations.filter(
            (g) => g.status === "completed"
          )}
          mixId={data.mix.id}
        />
      )}

      {status === "failed" && (
        <div className="flex flex-col items-center gap-4 py-12">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive font-medium">
            Something went wrong with this mix.
          </p>
          <Button variant="outline" onClick={() => router.push("/")}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try a new mix
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: MixStatus }) {
  const variants: Record<MixStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Starting", variant: "secondary" },
    generating: { label: "Generating", variant: "default" },
    selecting: { label: "Select Elements", variant: "outline" },
    synthesizing: { label: "Synthesizing", variant: "default" },
    completed: { label: "Complete", variant: "secondary" },
    failed: { label: "Failed", variant: "destructive" },
  };

  const { label, variant } = variants[status];

  return (
    <Badge variant={variant} className="font-mono text-xs shrink-0">
      {(status === "generating" || status === "synthesizing") && (
        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-current animate-pulse" />
      )}
      {label}
    </Badge>
  );
}
