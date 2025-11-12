# 🔮 Oracle MVP

A modular spiritual self-discovery app that delivers personal readings by combining multiple symbolic systems (Astrology + Destiny Matrix).

## Quick Start

```bash
# 1. Set up environment
cp .env.local.example .env.local
# Edit with your Supabase, Sanity, and OpenAI credentials

# 2. Create database
npm run setup:db

# 3. Populate CMS
npm run seed:cms

# 4. Start development
npm run dev
```

See **[QUICKSTA RT.md](./QUICKSTART.md)** for detailed setup instructions.

## Architecture

```
┌─────────────────┐        ┌────────────────────┐        ┌───────────────────┐
│  Next.js (App)  │  API   │  Supabase (PG/RLS) │  CMS   │     Sanity CMS    │
│  React + R3F    │◀──────▶│  users/reports/syn │◀──────▶│  systems/dim/interp│
└─────────────────┘        └────────────────────┘        └───────────────────┘
         │                           │
         │                           ▼
         │                    ┌───────────────┐
         │  Synthesis (AI)    │ Vercel AI SDK │ → OpenAI (GPT-4o)
         └───────────────────▶└───────────────┘
```

## Features

- ⭐ **Astrology** - Sun/Moon/Rising signs from birth date
- 🔢 **Destiny Matrix** - 30+ node calculations from date numerology
- 🤖 **AI Synthesis** - Unified narrative via OpenAI GPT-4o
- 🗂️ **CMS-driven** - Interpretations managed in Sanity
- 🔒 **RLS Protected** - Users only see their own data

## Project Structure

```
oracle/
├── app/                          # Next.js app router
├── lib/
│   ├── supabase.ts               # Database client
│   ├── cms.ts                    # Sanity client
│   ├── matrix.ts                 # Matrix calculation (TODO)
│   └── astro.ts                  # Astrology calculation (TODO)
├── scripts/
│   ├── setup-db.ts               # Run migrations
│   ├── seed-sanity.ts            # Populate CMS
│   └── seed-supabase.ts          # Seed demo data
├── sanity/
│   └── schemas/                  # CMS schema definitions
├── migrations/
│   └── 001_create_tables.sql     # Database schema
└── PHASE1_SETUP.md               # Detailed setup guide
```

## Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run setup:db         # Run database migrations
npm run seed:cms         # Populate Sanity CMS
npm run seed:supabase    # Create demo user and reports
```

## Next Steps

Phase 1 (Infrastructure) is complete. Ready for:

- **Phase 2:** Implement calculation engines
  - Destiny Matrix: `lib/matrix.ts`
  - Astrology: `lib/astro.ts`

- **Phase 3:** Build API endpoints
  - `/api/report` - calculate nodes, fetch interpretations, persist
  - `/api/synthesis` - AI meta-narrative over reports

- **Phase 4:** Build frontend
  - Report viewer component
  - Streaming UI

See [CLAUDE.md](./CLAUDE.md) for full specification.

## Configuration

Create `.env.local` from `.env.local.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token

OPENAI_API_KEY=your_api_key
```

## Database Schema

### reports
- `id` (uuid, PK)
- `user_id` (uuid) - via auth
- `system_key` (text) - "astro" | "matrix"
- `inputs` (jsonb) - birth data
- `nodes` (jsonb) - calculated values
- `interpretations` (jsonb) - matched content from CMS
- `created_at` (timestamptz)

### synthesis
- `id` (uuid, PK)
- `user_id` (uuid)
- `report_ids` (uuid[]) - refs to reports
- `request_payload` (jsonb)
- `response_payload` (jsonb) - AI narrative
- `ai_model` (text)
- `created_at` (timestamptz)

## CMS Content

Sanity has three schema types:

1. **System** - e.g., "Astrology", "Destiny Matrix"
2. **ValueSet** - e.g., zodiac signs (12), arcana 1-22 (22)
3. **Dimension** - interpretable axis with content for each value

See `sanity/schemas/` for definitions.

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Next.js Route Handlers, TypeScript
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **CMS:** Sanity
- **AI:** Vercel AI SDK + OpenAI GPT-4o
- **Astronomy:** astronomia.js (Meeus algorithms)

## Development

```bash
# Open Sanity Studio
npx sanity dev

# In another terminal, start Next.js
npm run dev
```

Then:
- Sanity Studio: http://localhost:3333
- Next.js: http://localhost:3000

---

📖 For detailed setup, see [PHASE1_SETUP.md](./PHASE1_SETUP.md)
