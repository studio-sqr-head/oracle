# Setup Checklist for Oracle MVP

Follow this checklist to complete Phase 1 setup.

## ✅ Part 1: Prerequisites

- [ ] Have Supabase account (https://supabase.com)
- [ ] Have Sanity account (https://sanity.io)
- [ ] Have OpenAI account (https://openai.com)
- [ ] Have Node.js 18+ installed
- [ ] Cloned/downloaded Oracle project

## ✅ Part 2: Create External Services

### Supabase Project
- [ ] Create new Supabase project
- [ ] Copy project URL → save for `.env.local`
- [ ] Go to Settings → API
  - [ ] Copy `anon (public)` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] Copy `service_role (secret)` key → `SUPABASE_SERVICE_ROLE_KEY`

### Sanity Project
- [ ] Create new Sanity project
- [ ] Create `production` dataset
- [ ] Copy project ID → save for `.env.local`
- [ ] Go to API → Create token
  - [ ] Create token with write access (for seeding)
  - [ ] Copy token → `SANITY_API_TOKEN`

### OpenAI API
- [ ] Generate API key at https://platform.openai.com/api-keys
- [ ] Copy key → `OPENAI_API_KEY`

## ✅ Part 3: Configure Project

- [ ] Copy environment template:
  ```bash
  cp .env.local.example .env.local
  ```

- [ ] Edit `.env.local` with your credentials:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
  NEXT_PUBLIC_SANITY_DATASET=production
  SANITY_API_TOKEN=your_api_token
  OPENAI_API_KEY=your_api_key
  ```

- [ ] Verify `.env.local` is in `.gitignore`

## ✅ Part 4: Set Up Database

- [ ] Run database migrations:
  ```bash
  npm run setup:db
  ```

- [ ] Verify output shows:
  - [ ] "Migration completed successfully!"
  - [ ] "reports table created"
  - [ ] "synthesis table created"
  - [ ] "RLS enabled on 2 tables"

## ✅ Part 5: Populate CMS

- [ ] Seed Sanity CMS:
  ```bash
  npm run seed:cms
  ```

- [ ] Verify output shows:
  - [ ] 2 systems created (astro, matrix)
  - [ ] 2 value sets created (zodiac_signs, arcana_1_22)
  - [ ] 11 dimensions created
  - [ ] All with placeholder interpretations

- [ ] Verify in Sanity Studio:
  ```bash
  npx sanity dev
  ```
  - [ ] Open http://localhost:3333
  - [ ] Browse "Systems" → see "Astrology" and "Destiny Matrix"
  - [ ] Browse "Dimensions" → see all 11 dimensions
  - [ ] Browse "Value Sets" → see zodiac and arcana

## ✅ Part 6: Verify Installation

- [ ] Install dependencies (if not already done):
  ```bash
  npm install
  ```

- [ ] Start dev server:
  ```bash
  npm run dev
  ```

- [ ] Verify Next.js starts without errors on http://localhost:3000

- [ ] Check that all environment variables are recognized:
  - [ ] No "Missing environment variables" errors in console
  - [ ] No connection errors to Supabase or Sanity

## ✅ Part 7: Optional - Create Demo Data

- [ ] Seed Supabase with demo user and reports:
  ```bash
  npm run seed:supabase
  ```

- [ ] Verify output shows:
  - [ ] Demo user created (demo@oracle.local)
  - [ ] Astrology report created
  - [ ] Matrix report created
  - [ ] Synthesis record created

## 🎉 Phase 1 Complete!

If all checkboxes are complete, your infrastructure is ready for Phase 2.

## Next Steps

Ready to implement Phase 2? Run:

```bash
# Start development
npm run dev

# In another terminal, open Sanity Studio
npx sanity dev
```

Next phase will implement:
1. Destiny Matrix calculation engine (`lib/matrix.ts`)
2. Astrology calculation engine (`lib/astro.ts`)
3. API endpoints (`/api/report`, `/api/synthesis`)
4. Frontend components

---

**Stuck?** Check [PHASE1_SETUP.md](./PHASE1_SETUP.md) for troubleshooting.
