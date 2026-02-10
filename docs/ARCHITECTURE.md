# Architecture

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand |
| Database | Supabase PostgreSQL |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (@supabase/ssr) |
| AI | Google Gemini (@google/genai) |
| Job Queue | Trigger.dev v3 |
| Storage | Cloudflare R2 (S3-compatible) |
| Payments | Stripe (scaffolded, not implemented) |
| Deployment | Railway |

## Key Patterns

### Model Adapter Pattern
`src/services/models/types.ts` defines `ModelAdapter` interface. Adding a new AI model = implementing this interface. Factory in `src/services/models/index.ts`.

### Server vs Client Components
- Pages are server components (data fetching)
- Interactive UI is client components (`"use client"`)
- Server actions for simple mutations (feedback)
- API routes for complex operations (mix creation → triggers background jobs)

### Async Job Orchestration
Trigger.dev handles long-running image generation:
1. API route triggers `generate-mix` task
2. Task fans out 3 parallel `generate-image` subtasks
3. Frontend subscribes via `useRealtimeRun` for live updates
4. No polling or WebSocket plumbing needed

### Image Pipeline
All images: generate → compress with sharp (WebP, 80%, max 1024px) → upload to R2 → serve via signed URLs

## Folder Structure
```
src/
├── app/           # Next.js pages + API routes
├── components/
│   ├── ui/        # shadcn/ui base components
│   └── features/  # Feature-specific components
├── lib/           # Utilities (db, supabase, storage, env)
├── services/      # Business logic (model adapters)
├── stores/        # Zustand stores
├── trigger/       # Trigger.dev task definitions
├── types/         # Shared TypeScript types
└── hooks/         # Custom React hooks
```
