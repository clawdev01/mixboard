# API Reference

## Endpoints

### POST /api/mix/create
Create a new mix and start image generation.

**Auth:** Required
**Body:** `{ prompt: string }` (3-1000 chars)
**Response:** `{ mixId: string, runId: string, publicAccessToken: string }`
**Side effects:** Deducts 1 credit, triggers generate-mix background task.

### GET /api/mix/[mixId]
Get full mix data with generations, selections, and synthesis result.

**Auth:** Required (must be mix owner)
**Response:** Full mix object with nested relations.

### POST /api/mix/[mixId]/select
Submit element selections and start synthesis.

**Auth:** Required (must be mix owner)
**Body:**
```json
{
  "selections": [
    { "category": "composition", "generationId": "uuid" },
    { "category": "colors", "generationId": "uuid" }
  ],
  "additionalInstructions": "optional string"
}
```
**Validation:** Min 3 selections required.
**Response:** `{ synthesisId: string, runId: string, publicAccessToken: string }`

### POST /api/mix/[mixId]/feedback
Submit quality feedback (server action).

**Auth:** Required
**Body:** `{ rating: "up" | "down" }`

### GET /api/user/credits
Get current user's credit balance.

**Auth:** Required
**Response:** `{ credits: number }`
