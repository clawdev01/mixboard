import { PromptInput } from "@/components/features/landing/prompt-input";
import { Layers, MousePointerClick, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          Mix the best of
          <br />
          <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            AI image generation
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Generate images from multiple AI styles. Pick the best parts from each.
          Mix them into one perfect image.
        </p>

        <div className="mt-10">
          <PromptInput />
        </div>
      </section>

      {/* How it works */}
      <section className="w-full max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StepCard
            step={1}
            icon={<Layers className="h-6 w-6" />}
            title="Generate"
            description="Enter a prompt and get 3 images in different styles — photorealistic, digital art, and cinematic."
          />
          <StepCard
            step={2}
            icon={<MousePointerClick className="h-6 w-6" />}
            title="Select"
            description="Pick the best composition, colors, subject, style, and background from each image."
          />
          <StepCard
            step={3}
            icon={<Sparkles className="h-6 w-6" />}
            title="Mix"
            description="AI synthesizes your selections into one cohesive final image that combines the best of everything."
          />
        </div>
      </section>
    </main>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-mono font-bold">
          {step}
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
