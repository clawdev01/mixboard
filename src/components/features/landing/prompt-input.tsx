"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export function PromptInput() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const charCount = prompt.length;
  const isValid = charCount >= 3 && charCount <= 1000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/mix/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please sign in to create a mix.");
          router.push("/login");
          return;
        }
        if (res.status === 403) {
          toast.error("No credits remaining.");
          return;
        }
        toast.error(data.error || "Failed to create mix");
        setLoading(false);
        return;
      }

      toast.success("Mix started!");
      router.push(`/mix/${data.mixId}`);
    } catch {
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create..."
          className="w-full min-h-[120px] rounded-xl border bg-muted/50 px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60"
          maxLength={1000}
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-3">
          <span
            className={`text-xs font-mono ${
              charCount > 900
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {charCount}/1000
          </span>
          <Button
            type="submit"
            size="lg"
            disabled={!isValid || loading}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Starting mix..." : "Mix It"}
          </Button>
        </div>
      </div>
    </form>
  );
}
