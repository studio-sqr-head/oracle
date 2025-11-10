# Phase 1: Infrastructure & Content Setup Guide

## ✅ Completed

Phase 1 infrastructure is now set up. Here's what's been created:

### 1. **Supabase Database**
- **Location:** `migrations/001_create_tables.sql`
- **Tables:**
  - `reports` - stores per-system calculations and interpretations
  - `synthesis` - stores AI-generated unified narratives
- **RLS Enabled:** Users can only access their own data via `auth.uid() = user_id`
- **Client Library:** `lib/supabase.ts` with helper functions

### 2. **Sanity CMS Schemas**
- **System** (`sanity/schemas/system.ts`) - defines systems like "astro" and "matrix"
- **ValueSet** (`sanity/schemas/valueSet.ts`) - defines value ranges (zodiac signs, arcana 1-22)
- **Dimension** (`sanity/schemas/dimension.ts`) - defines interpretable axes with content

### 3. **Seed Script**
- **Location:** `scripts/seed-sanity.ts`
- **Creates:**
  - 2 systems (astro, matrix)
  - 2 value sets (zodiac_signs: 12 signs, arcana_1_22: 1-22)
  - 11 dimensions (3 astrology + 8 matrix) with placeholder interpretations
  - ~300+ interpretation records (12 zodiac × 3 astro dims + 22 arcana × 8 matrix dims)

## 🚀 Next Steps: Manual Configuration

### Step 1: Set Up Supabase

1. Create a Supabase project at https://supabase.com
2. Copy your credentials to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
3. Fill in Supabase values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. Run the database migrations:
   ```bash
   npm run setup:db
   ```
   This will:
   - Create `reports` and `synthesis` tables
   - Enable RLS (Row Level Security)
   - Set up access policies
   - Verify everything is created

### Step 2: Set Up Sanity CMS

1. Create a Sanity project at https://sanity.io
2. Create a dataset named "production"
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your_api_token  (create in Sanity dashboard)
   ```

4. Install Sanity CLI (if not already installed):
   ```bash
   npm install -g sanity@latest
   ```

5. Seed the CMS:
   ```bash
   npm run seed:cms
   ```
   This populates Sanity with systems, value sets, dimensions, and placeholder interpretations.

6. Verify in Sanity Studio:
   ```bash
   npx sanity dev
   ```
   Studio opens at http://localhost:3333

### Step 3: Set Up OpenAI API

1. Create an OpenAI account at https://openai.com
2. Generate an API key
3. Add to `.env.local`:
   ```
   OPENAI_API_KEY=your_api_key
   ```

## 📁 Project Structure After Phase 1

```
oracle/
├── migrations/
│   └── 001_create_tables.sql          # Supabase schema
├── sanity/
│   └── schemas/
│       ├── system.ts                   # System type definition
│       ├── valueSet.ts                 # Value set type definition
│       └── dimension.ts                # Dimension type definition
├── scripts/
│   └── seed-sanity.ts                  # Populate CMS with data
├── lib/
│   ├── supabase.ts                     # Supabase client & helpers
│   └── cms.ts                          # Sanity client & helpers
├── app/
│   ├── layout.tsx                      # Root layout
│   └── globals.css                     # Tailwind styles
├── .env.local.example                  # Environment template
├── sanity.config.ts                    # Sanity studio config
├── next.config.ts                      # Next.js config
├── tailwind.config.ts                  # Tailwind config
└── tsconfig.json                       # TypeScript config
```

## 📋 Database Schema

### reports table
```sql
- id (uuid, PK)
- user_id (uuid) - references auth.users
- system_key (text) - "astro" | "matrix"
- inputs (jsonb) - { date, time?, location? }
- nodes (jsonb) - { sun_sign, moon_sign, ... } or { "XY(0)", "X(-4)", ... }
- interpretations (jsonb) - [{ dimensionKey, valueKey, content? }]
- created_at (timestamptz)
```

### synthesis table
```sql
- id (uuid, PK)
- user_id (uuid)
- report_ids (uuid[]) - references reports
- request_payload (jsonb)
- response_payload (jsonb)
- ai_model (text) - "gpt-4o"
- created_at (timestamptz)
```

## 🎯 Ready for Phase 2

Once configured, you're ready for:
- **Phase 2:** Implement calculation engines (Matrix, Astrology)
- **Phase 3:** Build API endpoints (/api/report, /api/synthesis)
- **Phase 4:** Build frontend components

## 🐛 Troubleshooting

**"npm run setup:db" fails with connection error**
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly
- Verify you're using the **Service Role Key** (not Anon Key)
- Check that Supabase project exists and is accessible
- Fallback: Manually run the SQL from `migrations/001_create_tables.sql` in Supabase dashboard

**"Missing Supabase environment variables"**
- Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**"Sanity seed fails"**
- Check that `SANITY_API_TOKEN` is set and has write permissions
- Verify project ID is correct
- Try `npx sanity dev` to test connection

**RLS errors on data access**
- Verify RLS policies are created (run `npm run setup:db` or check migration SQL)
- Test with authenticated user context

---

**Next:** Run through manual configuration above, then we'll implement Phase 2 calculation engines.
