# CLAUDE.md

Oracle is a modular spiritual self-discovery app that delivers personal readings by combining multiple symbolic systems. The MVP ships two systems—**Astrology (Sun/Moon/Rising)** and **Destiny Matrix (core grid + channels)**—generates per-system reports from CMS-authored interpretations, and produces a unified, human-sounding narrative using **Vercel AI SDK**. The platform is built to add new systems with minimal code by keeping calculation logic, content, and synthesis strictly separated.

---

## Table of Contents

1. [MVP Scope](#mvp-scope)
2. [Architecture](#architecture)
3. [Data Model](#data-model)
4. [CMS (Sanity) Schema](#cms-sanity-schema)
5. [DB (Supabase) Schema](#db-supabase-schema)
6. [Calculation Engines (Authoritative)](#calculation-engines-authoritative)

   * [Destiny Matrix](#destiny-matrix)
   * [Astrology](#astrology)
7. [APIs](#apis)

   * [/api/report](#apireport)
   * [/api/synthesis (Vercel AI SDK)](#apisynthesis-vercel-ai-sdk)
8. [Frontend](#frontend)
9. [Security, Observability, Costs](#security-observability-costs)
10. [MVP Roadmap](#mvp-roadmap)

---

## MVP Scope

* **Systems:**

  * **Astrology (Natal basics):** Sun Sign, Moon Sign (placeholder/upgradeable), Rising (placeholder/upgradeable)
  * **Destiny Matrix:** full calculation map; interpret a curated subset (e.g., Core, Outer Self, Ideal Partner, Financial Flow, Entrance to Relationship, Material Karma, Purpose, Health table)
* **Content:** interpretations authored in **Sanity** (one per *Dimension × Value*)
* **Reports:** per-system calculation + interpretation lookup
* **Synthesis:** unified narrative over reports via **Vercel AI SDK**
* **Extensibility:** add systems by defining Dimensions, Value Sets, Interpretations; swap/extend calculators without touching CMS or synthesis

---

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

* **Next.js 15 / React 19 / Tailwind**: UI + Route Handlers
* **Sanity**: Systems, Dimensions, Value Sets, Interpretations (authoring)
* **Supabase (Postgres + Auth + RLS)**: users, reports, synthesis
* **Vercel AI SDK**: streaming, provider-agnostic synthesis

---

## Data Model

### Concepts

* **System** — e.g., `astro`, `matrix`
* **Dimension** — interpretable axis (e.g., `sun_sign`, `x_neg4_outer_self`)
* **Value Set** — allowed values for a Dimension (zodiac signs, 1..22, etc.)
* **Interpretation** — content for (Dimension, Value)
* **Report** — user-specific results for one System (nodes + matched interpretations)
* **Synthesis** — AI meta-narrative over multiple Reports

### Relationships

* System 1—* Dimensions
* Dimension —1 Value Set
* (Dimension, Value) —1 Interpretation
* User 1—* Reports
* Synthesis references *multiple* Reports

### Examples

**Astrology**

* Dimensions: `sun_sign`, `moon_sign`, `rising_sign`
* Value Set: `zodiac_signs` = [aries..pisces]
* Interpretation: “Sun in Aries …”

**Destiny Matrix**

* Dimensions: `xy0_core`, `x_neg4_outer_self`, `z_neg1_ideal_partner`, …
* Value Set: `arcana_1_22` = [1..22]
* Interpretation: “Outer Self = 7 (Chariot) …”

---

## CMS (Sanity) Schema

> Authors define Systems → Value Sets → Dimensions → Interpretations (per valueKey).

**`schemas/system.ts`**

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "system",
  type: "document",
  title: "System",
  fields: [
    defineField({ name: "key", type: "string", description: "e.g., astro, matrix" }),
    defineField({ name: "name", type: "string" }),
    defineField({ name: "active", type: "boolean", initialValue: true }),
    defineField({ name: "description", type: "text" }),
  ],
});
```

**`schemas/valueSet.ts`**

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "valueSet",
  type: "document",
  title: "Value Set",
  fields: [
    defineField({ name: "key", type: "string", description: "e.g., zodiac_signs, arcana_1_22" }),
    defineField({
      name: "values",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "key", type: "string", description: "e.g., aries, 7" },
          { name: "title", type: "string", description: "e.g., Aries, The Chariot" },
          { name: "metadata", type: "object", fields: [
            { name: "order", type: "number" },
            { name: "glyph", type: "string" },
          ]}
        ]
      }]
    })
  ]
});
```

**`schemas/dimension.ts`**

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "dimension",
  type: "document",
  title: "Dimension",
  fields: [
    defineField({ name: "system", type: "reference", to: [{ type: "system" }] }),
    defineField({ name: "key", type: "string", description: "e.g., sun_sign, x_neg4_outer_self" }),
    defineField({ name: "name", type: "string" }),
    defineField({ name: "code", type: "string", description: "formula id e.g., X(-4), sun_sign" }),
    defineField({ name: "valueSet", type: "reference", to: [{ type: "valueSet" }] }),
    defineField({ name: "category", type: "string", description: "e.g., core, relationships" }),
    defineField({ name: "interpretations", type: "array", of: [{
      type: "object",
      fields: [
        { name: "valueKey", type: "string", description: "matches a valueSet.values.key" },
        { name: "content", type: "array", of: [{ type: "block" }] },
      ]
    }]})
  ]
});
```

---

## DB (Supabase) Schema

> Sanity is source of truth for content; Supabase stores user data, reports, synthesis.

```sql
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  system_key text not null,          -- 'astro' | 'matrix'
  inputs jsonb not null,             -- birth data, preferences, etc.
  nodes jsonb not null,              -- calculated values per dimension
  interpretations jsonb not null,    -- [{ dimensionKey, valueKey, contentRef? }]
  created_at timestamptz not null default now()
);

create index on public.reports (user_id, created_at desc);

create table public.synthesis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  report_ids uuid[] not null,
  request_payload jsonb not null,
  response_payload jsonb not null,   -- structured synthesis (or text)
  ai_model text not null,            -- e.g. 'gpt-4o'
  created_at timestamptz not null default now()
);
```

> Enable RLS so users can only access their own rows.

---

## Seeding Sanity

Seeds the CMS with systems, value sets, dimensions, and placeholder interpretations.

Create a file scripts/seed-sanity.ts and use the script from the spec (it creates astro and matrix with full placeholder content).

npm run seed:cms


Output:

2 systems (astro, matrix)

2 value sets (zodiac_signs, arcana_1_22)

20+ dimensions (Sun, Moon, Rising, Core, Outer Self, Ideal Partner, etc.)

Placeholder interpretations for every value (safe for dev/test)

DB (Supabase) Schema
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  system_key text not null,
  inputs jsonb not null,
  nodes jsonb not null,
  interpretations jsonb not null,
  created_at timestamptz default now()
);

create table public.synthesis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  report_ids uuid[] not null,
  request_payload jsonb not null,
  response_payload jsonb not null,
  ai_model text not null,
  created_at timestamptz default now()
);

## Seeding Supabase

Step 1 — Enable RLS + Policies
alter table public.reports enable row level security;
alter table public.synthesis enable row level security;

create policy "reports_owner_select" on public.reports for select using (auth.uid() = user_id);
create policy "reports_owner_insert" on public.reports for insert with check (auth.uid() = user_id);
create policy "synthesis_owner_select" on public.synthesis for select using (auth.uid() = user_id);
create policy "synthesis_owner_insert" on public.synthesis for insert with check (auth.uid() = user_id);

Step 2 — Seed script

Create scripts/seed-supabase.ts using the version provided above.
This script:

Creates a demo user (demo@oracle.local)

Calculates Matrix + Astro nodes

Fetches placeholder interpretations from Sanity

Inserts both reports

Adds one synthesis row tying them together

npm run seed:supabase


Result:

Demo user

Astro + Matrix reports

One synthesis (AI narrative placeholder)

## Calculation Engines (Authoritative)

### Shared reduction rule (Arcana 1–22)

```ts
/** Reduce any integer into 1..22; 0 ⇒ 22; handles negatives safely. */
export function arcana(n: number): number {
  let m = n % 22;
  if (m === 0) m = 22;
  return m < 0 ? ((m + 22) % 22) || 22 : m;
}
```

---

### Destiny Matrix

#### Base primitives (from ISO DOB `YYYY-MM-DD`)

```ts
const sumDigits = (n: number) => n.toString().split("").reduce((a, b) => a + +b, 0);

function baseFromDob(iso: string) {
  const [Yfull, Mfull, Dfull] = iso.split("-").map(Number);
  const D = sumDigits(Dfull);   // day sum
  const M = Mfull;              // month (1..12)
  const Y = sumDigits(Yfull);   // year sum
  const Y4 = Y * 4;             // material karma seed
  return { D, M, Y, Y4 };
}
```

#### Canonical node mapping (complete engine scaffolding)

```ts
export type MatrixNodes = Record<string, number>;
const a = (n: number) => arcana(n);

export function calculateMatrix(isoDate: string): MatrixNodes {
  const { D, M, Y, Y4 } = baseFromDob(isoDate);
  const nodes: MatrixNodes = {};

  // Bases
  nodes["X(-4)"] = a(D + D);   // Outer Self
  nodes["Y(4)"]  = a(M);       // Higher Self
  nodes["X(5)"]  = a(Y4);      // Material Karma seed

  // Provisional tail for center calculation (finalize after XY(0))
  let Ym1 = a(nodes["Y(4)"] + nodes["X(-4)"]);
  let Ym3 = a(Ym1 + nodes["Y(4)"]);

  // Center
  nodes["XY(0)"] = a(nodes["X(-4)"] + nodes["Y(4)"] + nodes["X(5)"] + Ym3);

  // Finalize tail with XY(0)
  Ym1 = a(nodes["XY(0)"] + nodes["Y(4)"]);
  Ym3 = a(Ym1 + nodes["Y(4)"]);
  nodes["Y(-1)"] = Ym1;       // Entrance to Relationship (program input)
  nodes["Y(-3)"] = Ym3;

  // Recompute center with finalized tail
  nodes["XY(0)"] = a(nodes["X(-4)"] + nodes["Y(4)"] + nodes["X(5)"] + nodes["Y(-3)"]);

  // Paternal diagonal A (NW/SE)
  nodes["A(3)"]  = a(nodes["X(-4)"] + nodes["Y(4)"]);
  nodes["A(-4)"] = a(nodes["X(5)"]  + nodes["Y(-3)"]);
  nodes["A(1)"]  = a(nodes["XY(0)"] + nodes["A(3)"]);
  nodes["A(2)"]  = a(nodes["A(3)"]  + nodes["A(1)"]);
  nodes["A(-2)"] = a(nodes["XY(0)"] + nodes["A(-4)"]);
  nodes["A(-3)"] = a(nodes["A(-4)"] + nodes["A(-2)"]);

  // Maternal diagonal B (NE/SW)
  nodes["B(3)"]  = a(nodes["Y(4)"]  + nodes["X(5)"]);
  nodes["B(-3)"] = a(nodes["Y(-3)"] + nodes["X(-4)"]);
  nodes["B(1)"]  = a(nodes["XY(0)"] + nodes["B(3)"]);
  nodes["B(2)"]  = a(nodes["B(3)"]  + nodes["B(1)"]);
  nodes["B(-1)"] = a(nodes["XY(0)"] + nodes["B(-3)"]);
  nodes["B(-2)"] = a(nodes["B(-3)"] + nodes["B(-1)"]);

  // X-chain neighbors for programs (Material Karma & Sexuality)
  nodes["X(3)"]  = a(nodes["XY(0)"] + nodes["X(5)"]);
  // Optionally fill X(4)/X(1)/X(2) with a consistent neighbor-add pattern:
  nodes["X(1)"]  = a(nodes["A(-3)"] + nodes["A(3)"]); // consistent scaffold
  nodes["X(2)"]  = a(nodes["XY(0)"] + nodes["X(1)"]);

  // Channels / bridges (program inputs)
  nodes["A(-1)"] = a(nodes["X(3)"] + nodes["Y(-1)"]); // Crossroad (love-money)
  // Z line placeholders (consistent sacral line neighbors; safe to compute now)
  nodes["Z(1)"]  = a(nodes["Y(4)"] + nodes["X(3)"]);  
  nodes["Z(-1)"] = a(nodes["Y(-3)"] + nodes["X(-4)"]);

  // Health table C(1..7) + aggregates (C8, C10)
  nodes["C(1)"]  = a(nodes["X(5)"]  + nodes["Y(-3)"]);
  nodes["C(2)"]  = a(nodes["X(3)"]  + nodes["Y(-1)"]);
  nodes["C(3)"]  = a(nodes["XY(0)"] + nodes["XY(0)"]);
  // Graceful fallbacks for neighbors not yet modeled:
  nodes["C(4)"]  = a((nodes["X(-1)"] || nodes["X(-4)"]) + (nodes["Y(1)"] || nodes["Y(4)"]));
  nodes["C(5)"]  = a((nodes["X(-2)"] || nodes["X(-4)"]) + (nodes["Y(2)"] || nodes["Y(4)"]));
  nodes["C(6)"]  = a((nodes["X(-3)"] || nodes["X(-4)"]) + (nodes["Y(3)"] || nodes["Y(4)"]));
  nodes["C(7)"]  = a(nodes["X(-4)"] + nodes["Y(4)"]);
  nodes["C(8)"]  = a(nodes["C(1)"] + nodes["C(2)"] + nodes["C(3)"] + nodes["C(4)"] + nodes["C(5)"]);
  nodes["C(10)"] = a((nodes["Y(4)"]||0) + (nodes["Y(3)"]||0) + (nodes["Y(2)"]||0) + (nodes["Y(1)"]||0) + nodes["XY(0)"] + nodes["Y(-1)"] + nodes["Y(-3)"]);

  // Purpose table N(1..3)
  nodes["N(1)"]  = a(nodes["X(-4)"] + nodes["X(5)"]);
  nodes["N(2)"]  = a(nodes["Y(4)"]  + nodes["Y(-3)"]);
  nodes["N(3)"]  = a(nodes["N(1)"]  + nodes["N(2)"]);

  return nodes;
}
```

#### Program → input nodes (MVP)

* **Core Energy:** `XY(0)`
* **Outer Self:** `X(-4)`
* **Entrance to Relationship:** `Y(-1)`
* **Ideal Partner:** `A(-1)`, `Z(-1)`, `Y(-1)` (+ optionally `X(-1)`, `Y(1)` if you later model them)
* **Financial Flow (Money Channel):** `Z(1)`
* **Material Karma:** `X(5)`, `X(4)`, `X(3)`
* **Purpose:** `N(1)`, `N(2)`, `N(3)`
* **Health (Chakras):** `C(1..7)`, aggregates `C(8)`, `C(10)`
* **Sexuality:** `XY(0)`, `X(1)`, `X(2)`

> You can compute **all nodes now**. If CMS lacks an interpretation, simply omit it from the rendered report; the engine remains stable.

---

### Astrology

Use **astronomia** (Meeus algorithms in JS) for accurate **Sun sign** from true solar longitude. Moon and Rising can be mocked initially and upgraded to a real ephemeris/API later.

#### Sun sign (accurate)

```ts
import { solar, julian } from "astronomia";

export function getSunSign(isoDate: string): string {
  const d = new Date(isoDate);
  const jd = julian.CalendarGregorianToJD(
    d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()
  );
  const lon = solar.apparentLongitude(jd); // degrees
  const idx = Math.floor((((lon % 360) + 360) % 360) / 30); // 0..11
  const SIGNS = [
    "aries","taurus","gemini","cancer","leo","virgo",
    "libra","scorpio","sagittarius","capricorn","aquarius","pisces"
  ];
  return SIGNS[idx];
}
```

#### Moon & Rising (MVP placeholders)

```ts
function deterministicSign(seed: string): string {
  const SIGNS = [
    "aries","taurus","gemini","cancer","leo","virgo",
    "libra","scorpio","sagittarius","capricorn","aquarius","pisces"
  ];
  const h = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  return SIGNS[h % 12];
}

export async function calculateAstro(opts: {
  date: string; time?: string; latitude?: number; longitude?: number;
}) {
  const sun_sign    = getSunSign(opts.date);
  const moon_sign   = deterministicSign(opts.date + "moon");     // replace with ephemeris
  const rising_sign = deterministicSign(opts.date + "rising");   // replace with ascendant calc
  return { sun_sign, moon_sign, rising_sign };
}
```

> Upgrade path: use `moonposition.position(jd).lon` for Moon; compute Ascendant from UT + lat/long (local sidereal time) or call a reliable ephemeris API.

---

## APIs

### `/app/api/report/route.ts`

Calculates nodes for requested systems, fetches interpretations, persists Reports.

```ts
import { NextRequest, NextResponse } from "next/server";
import { calculateAstro } from "@/lib/astro";
import { calculateMatrix } from "@/lib/matrix";
import { fetchInterpretations } from "@/lib/cms";
import { createReport } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId, inputs, systems = ["astro", "matrix"] } = await req.json();
  const reports: any[] = [];

  for (const system of systems) {
    if (system === "astro") {
      const nodes = await calculateAstro(inputs);
      const interpretations = await fetchInterpretations({
        systemKey: "astro",
        mapping: [
          { dimensionKey: "sun_sign", valueKey: nodes.sun_sign },
          { dimensionKey: "moon_sign", valueKey: nodes.moon_sign },
          { dimensionKey: "rising_sign", valueKey: nodes.rising_sign },
        ].filter(Boolean),
      });
      const report = await createReport({
        userId, systemKey: "astro", inputs, nodes, interpretations,
      });
      reports.push(report);
    }

    if (system === "matrix") {
      const nodes = calculateMatrix(inputs.date);
      const mappings = [
        { dimensionKey: "xy0_core", valueKey: String(nodes["XY(0)"]) },
        { dimensionKey: "x_neg4_outer_self", valueKey: String(nodes["X(-4)"]) },
        { dimensionKey: "z_neg1_ideal_partner", valueKey: String(nodes["Z(-1)"]) },
        { dimensionKey: "y_neg1_entrance_to_relationship", valueKey: String(nodes["Y(-1)"]) },
        { dimensionKey: "z1_financial_flow", valueKey: String(nodes["Z(1)"]) },
        { dimensionKey: "material_karma_x3", valueKey: String(nodes["X(3)"]) },
        { dimensionKey: "purpose_n3", valueKey: String(nodes["N(3)"]) },
        // add more as you author content
      ];
      const interpretations = await fetchInterpretations({
        systemKey: "matrix", mapping: mappings,
      });
      const report = await createReport({
        userId, systemKey: "matrix", inputs, nodes, interpretations,
      });
      reports.push(report);
    }
  }

  return NextResponse.json({ reports });
}
```

### `/app/api/synthesis/route.ts` (Vercel AI SDK)

Streams a unified narrative from reports.

```ts
import { NextRequest } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: NextRequest) {
  const { user, reports } = await req.json();

  const systemPrompt = `
You are OracleGPT, a spiritual guide. Synthesize insights from multiple systems into one clear, empowering narrative.
Avoid repetition. Tie patterns together. Tone: ${user.tone ?? "warm and grounded"}.
Language: ${user.language ?? "en"}.
`;

  const reportPrompt = reports.map((r: any) => {
    return `System: ${r.system_key}
${(r.interpretations || [])
  .map((i: any) => `- ${i.dimensionKey}=${i.valueKey}: ${blocksToPlain(i.content).slice(0, 220)}...`)
  .join("\n")}`;
  }).join("\n\n");

  const userPrompt = `
Profile: gender=${user.gender}
${reportPrompt}

Write ~6–10 sentences in 2–3 paragraphs. Start with an integrative headline.
`;

  const result = await streamText({
    model: openai("gpt-4o"),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  return result.toAIStreamResponse();
}

function blocksToPlain(blocks: any[] = []) {
  return blocks
    .map((b) => (b?.children ? b.children.map((c: any) => c.text).join("") : ""))
    .join("\n")
    .trim();
}
```

---

## Frontend

Minimal streaming viewer (call `/api/report`, then `/api/synthesis`):

```tsx
"use client";
import { useState } from "react";

export default function ReportViewer({ user }: { user: any }) {
  const [reports, setReports] = useState<any[] | null>(null);
  const [narrative, setNarrative] = useState<string>("");

  async function generate() {
    const inputs = { date: "1990-08-31", time: "14:30", location: "London" };
    const r = await fetch("/api/report", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, inputs, systems: ["astro", "matrix"] }),
    }).then(res => res.json());
    setReports(r.reports);

    const synth = await fetch("/api/synthesis", {
      method: "POST",
      body: JSON.stringify({ user, reports: r.reports }),
    });
    const reader = synth.body!.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      acc += decoder.decode(value);
      setNarrative(acc);
    }
  }

  return (
    <div className="max-w-prose mx-auto p-6">
      <button onClick={generate} className="px-4 py-2 rounded bg-black text-white">
        Generate Report + Synthesis
      </button>
      <pre className="mt-6 text-sm bg-zinc-50 p-4 rounded overflow-auto">
        {JSON.stringify(reports, null, 2)}
      </pre>
      <article className="prose mt-6 whitespace-pre-wrap">{narrative}</article>
    </div>
  );
}
```

---

## Security, Observability, Costs

* **Secrets:** `OPENAI_API_KEY`, Supabase keys in Vercel env (server only)
* **RLS:** restrict `reports` / `synthesis` by `user_id`
* **Rate limiting:** middleware on `/api/report` & `/api/synthesis`
* **Logging:** Vercel function logs; optionally persist synthesis metadata
* **Costs:** cache CMS reads; keep synthesis prompt concise; summarize long blocks if needed

---

## MVP Roadmap

**Step 1**

* Supabase tables + RLS
* Sanity schemas; seed:

  * `zodiac_signs` (12), `arcana_1_22` (1..22)
  * Dimensions for Astro (Sun/Moon/Rising), Matrix (Core/Outer/Ideal/Entrance/Money/Purpose/Health)
  * Add interpretations for a minimal but demo-ready set
* Implement `/api/report` with accurate sun sign + full matrix calc

**Step 2**

* `/api/synthesis` with Vercel AI SDK (streaming)
* Frontend integrate; persist synthesis results
* Expand Matrix/ Astro interpretations coverage

**Step 3**

* Replace Moon/Rising with real ephemeris
* Add categories/sections to report UI
* Export/share, QA, launch

---

**End of `CLAUDE.md`**
