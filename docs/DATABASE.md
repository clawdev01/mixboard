# Database Schema

## Provider
Supabase PostgreSQL, accessed via Drizzle ORM with `postgres` driver.

## Tables

### users
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto-generated |
| email | text | unique, not null |
| credits_remaining | integer | default 5 |
| created_at | timestamp | auto |
| updated_at | timestamp | auto |

### mixes
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| prompt | text | user's original prompt |
| status | mix_status enum | pending → generating → selecting → synthesizing → completed / failed |
| trigger_run_id | text | Trigger.dev run ID for realtime |
| created_at | timestamp | auto |
| updated_at | timestamp | auto |

### generations
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| mix_id | uuid | FK → mixes.id |
| model_name | text | e.g. 'gemini-2.0-flash' |
| model_provider | text | e.g. 'google' |
| style_variant | text | 'photorealistic', 'digital_art', 'cinematic' |
| image_url | text | R2 URL, nullable until generation complete |
| status | generation_status enum | pending → generating → completed / failed |
| error_message | text | nullable |
| generation_time_ms | integer | nullable |
| created_at | timestamp | auto |

### selections
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| mix_id | uuid | FK → mixes.id |
| category | text | composition, colors, subject, style, background |
| generation_id | uuid | FK → generations.id |
| created_at | timestamp | auto |

### synthesis_results
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| mix_id | uuid | FK → mixes.id |
| image_url | text | R2 URL, nullable until complete |
| synthesis_prompt | text | full prompt sent to Gemini |
| synthesis_model | text | model used |
| status | synthesis_status enum | pending → synthesizing → completed / failed |
| error_message | text | nullable |
| created_at | timestamp | auto |

## Migrations
Run `pnpm db:push` to push schema to Supabase (dev).
Run `pnpm db:generate` + `pnpm db:migrate` for production migrations.
