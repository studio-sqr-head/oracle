import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { calculateMatrix } from "../lib/matrix.js";
import { calculateAstro } from "../lib/astro.js";
import { fetchInterpretations } from "../lib/cms.js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Demo user DOB: August 31, 1990
const DEMO_DOB = "1990-08-31";
const DEMO_EMAIL = "demo@oracle.test";
const DEMO_PASSWORD = "DemoPassword123!";

async function seedSupabase() {
  console.log("🌱 Seeding Supabase with demo data...\n");

  try {
    // Use a static UUID for demo user (or skip auth entirely)
    console.log("👤 Using demo user ID...");
    // For demo purposes, we'll use a fixed UUID
    const userId = "00000000-0000-0000-0000-000000000001";
    console.log(`  ✓ Demo user ID: ${userId}`);

    // Step 2: Calculate Astrology
    console.log("\n⭐ Calculating Astrology...");
    const astroNodes = await calculateAstro({
      date: DEMO_DOB,
    });
    console.log(`  ✓ Sun: ${astroNodes.sun_sign}`);
    console.log(`  ✓ Moon: ${astroNodes.moon_sign}`);
    console.log(`  ✓ Rising: ${astroNodes.rising_sign}`);

    // Step 3: Fetch Astrology interpretations
    console.log("\n📖 Fetching Astrology interpretations...");
    const astroInterpretations = await fetchInterpretations({
      systemKey: "astro",
      mapping: [
        { dimensionKey: "sun_sign", valueKey: astroNodes.sun_sign },
        { dimensionKey: "moon_sign", valueKey: astroNodes.moon_sign },
        { dimensionKey: "rising_sign", valueKey: astroNodes.rising_sign },
      ],
    });
    console.log(`  ✓ Found ${astroInterpretations.length} interpretations`);

    // Step 4: Create Astrology Report
    console.log("\n📝 Creating Astrology report...");
    const { data: astroReport, error: astroError } = await supabase
      .from("reports")
      .insert([
        {
          user_id: userId,
          system_key: "astro",
          inputs: { date: DEMO_DOB },
          nodes: astroNodes,
          interpretations: astroInterpretations,
        },
      ])
      .select()
      .single();

    if (astroError) throw astroError;
    console.log(`  ✓ Report created: ${astroReport.id}`);

    // Step 5: Calculate Matrix
    console.log("\n🔢 Calculating Destiny Matrix...");
    const matrixNodes = calculateMatrix(new Date(DEMO_DOB));
    console.log(`  ✓ Calculated ${Object.keys(matrixNodes).length} nodes`);
    console.log(`    - Core Energy: ${matrixNodes["XY(0)"]}`);
    console.log(`    - Outer Self: ${matrixNodes["X(-4)"]}`);
    console.log(`    - Ideal Partner: ${matrixNodes["Z(-1)"]}`);

    // Step 6: Fetch Matrix interpretations
    console.log("\n📖 Fetching Matrix interpretations...");
    const matrixMappings = [
      { dimensionKey: "xy0_core", valueKey: String(matrixNodes["XY(0)"]) },
      { dimensionKey: "x_neg4_outer_self", valueKey: String(matrixNodes["X(-4)"]) },
      { dimensionKey: "z_neg1_ideal_partner", valueKey: String(matrixNodes["Z(-1)"]) },
      { dimensionKey: "y_neg1_entrance_to_relationship", valueKey: String(matrixNodes["Y(-1)"]) },
      { dimensionKey: "z1_financial_flow", valueKey: String(matrixNodes["Z(1)"]) },
      { dimensionKey: "x5_material_karma", valueKey: String(matrixNodes["X(5)"]) },
      { dimensionKey: "n3_purpose", valueKey: String(matrixNodes["N(3)"]) },
      { dimensionKey: "c1_health_root", valueKey: String(matrixNodes["C(1)"]) },
    ];

    const matrixInterpretations = await fetchInterpretations({
      systemKey: "matrix",
      mapping: matrixMappings,
    });
    console.log(`  ✓ Found ${matrixInterpretations.length} interpretations`);

    // Step 7: Create Matrix Report
    console.log("\n📝 Creating Matrix report...");
    const { data: matrixReport, error: matrixError } = await supabase
      .from("reports")
      .insert([
        {
          user_id: userId,
          system_key: "matrix",
          inputs: { date: DEMO_DOB },
          nodes: matrixNodes,
          interpretations: matrixInterpretations,
        },
      ])
      .select()
      .single();

    if (matrixError) throw matrixError;
    console.log(`  ✓ Report created: ${matrixReport.id}`);

    // Step 8: Create synthesis record (placeholder)
    console.log("\n✨ Creating synthesis record...");
    const { data: synthesis, error: synthesisError } = await supabase
      .from("synthesis")
      .insert([
        {
          user_id: userId,
          report_ids: [astroReport.id, matrixReport.id],
          request_payload: {
            tone: "warm and grounded",
            language: "en",
          },
          response_payload: {
            narrative: "[AI synthesis will be generated when /api/synthesis is called]",
          },
          ai_model: "gpt-4o",
        },
      ])
      .select()
      .single();

    if (synthesisError) throw synthesisError;
    console.log(`  ✓ Synthesis created: ${synthesis.id}`);

    console.log("\n✨ Seed complete!");
    console.log("\nDemo data created:");
    console.log(`  User ID: ${userId}`);
    console.log("\nReports created:");
    console.log(`  Astrology: ${astroReport.id}`);
    console.log(`  Matrix: ${matrixReport.id}`);
    console.log(`  Synthesis: ${synthesis.id}`);
    console.log("\n💡 Note: To access this data with auth, you need to create");
    console.log("   a user account with Supabase Auth and update the user_id.");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seedSupabase();
