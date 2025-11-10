# 🚀 Oracle MVP - Quick Start Guide

## Prerequisites

You'll need accounts at:
- **Supabase** (https://supabase.com) - for database
- **Sanity** (https://sanity.io) - for CMS
- **OpenAI** (https://openai.com) - for AI synthesis

## Setup (5 minutes)

### 1. Environment Setup

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your credentials:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
# SANITY_API_TOKEN=your_api_token
# OPENAI_API_KEY=your_api_key
```

### 2. Create Supabase Database

```bash
npm run setup:db
```

This runs the SQL migration and creates:
- `reports` table with RLS
- `synthesis` table with RLS
- All access policies

### 3. Populate Sanity CMS

```bash
npm run seed:cms
```

This creates:
- 2 systems (Astrology, Destiny Matrix)
- 2 value sets (Zodiac signs, Arcana 1-22)
- 11 dimensions (3 astrology + 8 matrix)
- ~300 placeholder interpretations

### 4. Verify Setup

```bash
# Check Sanity Studio
npx sanity dev

# In another terminal, start Next.js dev server
npm run dev
```

## ✨ You're Ready!

Your Oracle MVP is now set up with:
- ✅ Database (Supabase) with user isolation via RLS
- ✅ CMS (Sanity) with content schema
- ✅ Placeholder interpretations ready for real content
- ✅ Ready for calculation engines (Phase 2)

## Next Steps

1. **Implement calculation engines:**
   - Destiny Matrix: `lib/matrix.ts`
   - Astrology: `lib/astro.ts`

2. **Build API endpoints:**
   - `/api/report` - calculate + persist
   - `/api/synthesis` - AI narrative

3. **Create frontend:**
   - Report viewer component

See `PHASE1_SETUP.md` for detailed information.
