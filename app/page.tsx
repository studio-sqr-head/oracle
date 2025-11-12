"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Sparkles, Calendar, Star, Grid3x3 } from "lucide-react";

interface Report {
  id: string;
  system_key: string;
  nodes: Record<string, any>;
  interpretations: Array<{
    dimensionKey: string;
    valueKey: string;
    content?: any[]; // Sanity portable text blocks
  }>;
}

export default function Home() {
  const [date, setDate] = useState();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateReport() {
    setLoading(true);
    setError("");
    setReports(null);
    setNarrative("");

    try {
      // Call /api/report
      const reportResponse = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "00000000-0000-0000-0000-000000000001",
          inputs: { date },
          systems: ["astro", "matrix"],
        }),
      });

      if (!reportResponse.ok) {
        throw new Error(
          `Failed to generate reports: ${reportResponse.statusText}`
        );
      }

      const { reports: generatedReports } = await reportResponse.json();
      setReports(generatedReports);

      const synthesisResponse = await fetch("/api/synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { tone: "warm and grounded", language: "en", gender: "neutral" },
          reports: generatedReports,
        }),
      });

      if (!synthesisResponse.ok) {
        throw new Error(`Failed to generate synthesis: ${synthesisResponse.statusText}`);
      }

      const reader = synthesisResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let acc = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value);
          setNarrative(acc);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="border-b py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center mb-4">
              <Sparkles className="w-16 h-16" />
            </div>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Oracle
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Personal readings combining Astrology & Destiny Matrix
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16">
        {/* Input Section */}
        <div className="mb-16 space-y-6">
 
          <div className="flex flex-row gap-4 gap-2 justify-center">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              className="sm:max-w-xs"
              placeholder="Date of Birth"
              aria-label="Date of Birth"
            />
            <Button
              onClick={generateReport}
              disabled={loading}
              size="lg"
              className="sm:min-w-[200px]"
            >
              {loading && <Loader2 className="animate-spin" />}
              {loading ? "Generating..." : "Generate Reading"}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-16 p-6 space-y-2">
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
              Error
            </h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Reports Section */}
        {reports && (
          <div className="space-y-24 mb-24">
            {reports.map((report) => (
              <div key={report.id} className="space-y-12">
                {/* Report Header */}
                <div className="flex items-start gap-4 pb-6 border-b">
                  {report.system_key === "astro" ? (
                    <Star className="w-10 h-10 flex-shrink-0" />
                  ) : (
                    <Grid3x3 className="w-10 h-10 flex-shrink-0" />
                  )}
                  <div className="space-y-2">
                    <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                      {report.system_key === "astro" ? "Astrology Report" : "Destiny Matrix Report"}
                    </h2>
                    <p className="text-muted-foreground">
                      {report.interpretations.length} key dimensions analyzed
                    </p>
                  </div>
                </div>

  



                {/* Interpretations */}
                <div className="space-y-6">
                  <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    Detailed Interpretations
                  </h3>
                  <div className="space-y-8">
                    {report.interpretations.map((interp, idx) => {
                      // Extract text from Sanity portable text blocks
                      let content = "No interpretation available";
                      if (interp.content && Array.isArray(interp.content)) {
                        content = interp.content
                          .map((block: any) => {
                            if (block._type === "block" && block.children) {
                              return block.children
                                .map((child: any) => child.text || "")
                                .join("");
                            }
                            return "";
                          })
                          .join("\n\n")
                          .trim() || "No interpretation available";
                      }

                      const dimensionName = interp.dimensionKey
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase());

                      return (
                        <div key={idx} className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="scroll-m-20 text-lg font-semibold tracking-tight">
                              {dimensionName}
                            </h4>
                            <Badge className="flex-shrink-0">{interp.valueKey}</Badge>
                          </div>
                          <p className="leading-7 text-muted-foreground whitespace-pre-line">
                            {content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Synthesis Section */}
        {narrative && (
          <div className="space-y-12 mb-24">
            <div className="flex items-start gap-4 pb-6 border-b">
              <Sparkles className="w-10 h-10 flex-shrink-0" />
              <div className="space-y-2">
                <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                  Unified Narrative
                </h2>
                <p className="text-muted-foreground">
                  AI-synthesized insights from your complete reading
                </p>
              </div>
            </div>
            <div>
              <p className="text-lg leading-7 text-muted-foreground whitespace-pre-wrap">
                {narrative}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 space-y-4">
            <Loader2 className="w-16 h-16 animate-spin mx-auto" />
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
              Generating your reading...
            </h3>
            <p className="text-muted-foreground">This may take a moment</p>
          </div>
        )}

      </div>
    </div>
  );
}
