import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

interface PortableTextBlock {
  _type: string;
  children?: Array<{
    _type: string;
    text: string;
    marks?: string[];
  }>;
}

function blocksToPlain(blocks: PortableTextBlock[] = []): string {
  return blocks
    .map((b) => {
      if (b._type === "block" && b.children) {
        return b.children.map((c) => c.text).join("");
      }
      return "";
    })
    .join("\n")
    .trim();
}

export async function POST(req: Request) {
  try {
    const { user, reports } = await req.json();

    if (!reports || reports.length === 0) {
      return new Response("No reports provided", { status: 400 });
    }

    const systemPrompt = `You are OracleGPT, a spiritual guide specializing in holistic self-discovery.

Your role is to synthesize insights from multiple divination systems (Astrology and Destiny Matrix) into one coherent, empowering narrative that reveals hidden patterns and possibilities.

Guidelines:
- Create an integrated story that connects patterns across systems
- Avoid repetition by synthesizing rather than listing
- Use warm, grounded language
- Focus on empowerment and actionable wisdom
- Keep mystical elements balanced with practical insight
- Acknowledge the complementary nature of different systems

Tone: ${user?.tone ?? "warm, grounded, and insightful"}
Language: ${user?.language ?? "English"}
Gender/Energy: ${user?.gender ?? "neutral"}`;

    const reportPrompt = reports
      .map((r: any) => {
        const interpretations = (r.interpretations || [])
          .map((i: any) => {
            const content = blocksToPlain(i.content);
            return `${i.dimensionKey}=${i.valueKey}: ${content}`;
          })
          .join("\n");

        return `**${r.system_key.toUpperCase()} System**
${interpretations}`;
      })
      .join("\n\n");

    const userPrompt = `Here is spiritual insight data from multiple divination systems:

${reportPrompt}

Create a 5-8 sentence narrative (2-3 paragraphs) that weaves these insights together into a unified message. Begin with an integrative headline that captures the core theme. Then develop the narrative, finding meaningful connections between the systems. End with a forward-looking insight.

Focus on:
1. Unique intersections between systems
2. Overarching life themes
3. Practical wisdom for the present moment`;

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
    });

    // Return as streaming response for frontend compatibility
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("Error in /api/synthesis:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
