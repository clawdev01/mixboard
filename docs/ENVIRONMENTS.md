# Environment Configuration

## Required Variables

### Supabase
| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase service role key (admin) |
| `DATABASE_URL` | Server only | PostgreSQL connection string |

### Google Gemini
| Variable | Scope | Description |
|----------|-------|-------------|
| `GEMINI_API_KEY` | Server only | Gemini API key for image generation |

### Trigger.dev
| Variable | Scope | Description |
|----------|-------|-------------|
| `TRIGGER_SECRET_KEY` | Server only | Trigger.dev secret key |

### Cloudflare R2
| Variable | Scope | Description |
|----------|-------|-------------|
| `R2_ACCOUNT_ID` | Server only | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Server only | R2 access key |
| `R2_SECRET_ACCESS_KEY` | Server only | R2 secret key |
| `R2_BUCKET_NAME` | Server only | R2 bucket name |

## Notes
- All images are served via signed URLs (1-hour expiry). No public R2 URL needed.
- Trigger.dev Realtime uses `publicAccessToken` from `tasks.trigger()` server-side — no public API key needed.
- Google OAuth is disabled. Auth is email/password only.

## Setup
1. Create Supabase project at supabase.com
2. Get Gemini API key from Google AI Studio
3. Create Trigger.dev project at trigger.dev
4. Create Cloudflare R2 bucket at Cloudflare dashboard
5. Copy `.env.local` and fill in values
