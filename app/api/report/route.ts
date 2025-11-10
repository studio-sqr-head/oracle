import { NextRequest, NextResponse } from "next/server";
import { calculateAstro } from "@/lib/astro";
import { calculateMatrix } from "@/lib/matrix";
import { fetchInterpretations } from "@/lib/cms";
import { createReport } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId, inputs, systems = ["astro", "matrix"] } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (!inputs?.date) {
      return NextResponse.json(
        { error: "inputs.date is required (ISO format YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const reports: any[] = [];

    // Generate Astrology report if requested
    if (systems.includes("astro")) {
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
        userId,
        systemKey: "astro",
        inputs,
        nodes,
        interpretations,
      });

      reports.push(report);
    }

    // Generate Matrix report if requested
    if (systems.includes("matrix")) {
      const nodes = calculateMatrix(inputs.date);

      const mappings = [
        { dimensionKey: "xy0_core", valueKey: String(nodes["XY(0)"]) },
        { dimensionKey: "x_neg4_outer_self", valueKey: String(nodes["X(-4)"]) },
        {
          dimensionKey: "y_neg1_entrance_to_relationship",
          valueKey: String(nodes["Y(-1)"]),
        },
        { dimensionKey: "z_neg1_ideal_partner", valueKey: String(nodes["Z(-1)"]) },
        { dimensionKey: "z1_financial_flow", valueKey: String(nodes["Z(1)"]) },
        { dimensionKey: "x5_material_karma", valueKey: String(nodes["X(5)"]) },
        { dimensionKey: "n3_purpose", valueKey: String(nodes["N(3)"]) },
        { dimensionKey: "c1_health_root", valueKey: String(nodes["C(1)"]) },
      ];

      const interpretations = await fetchInterpretations({
        systemKey: "matrix",
        mapping: mappings,
      });

      const report = await createReport({
        userId,
        systemKey: "matrix",
        inputs,
        nodes,
        interpretations,
      });

      reports.push(report);
    }

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error("Error in /api/report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate reports" },
      { status: 500 }
    );
  }
}
