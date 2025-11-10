"use client";

import { useState } from "react";

interface Report {
  id: string;
  system_key: string;
  nodes: Record<string, any>;
  interpretations: Array<{
    dimensionKey: string;
    valueKey: string;
  }>;
}

export default function Home() {
  const [date, setDate] = useState("1990-08-31");
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

      // Call /api/synthesis
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

      // Stream the response
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">🔮 Oracle</h1>
          <p className="text-purple-200 text-lg">
            Personal readings from Astrology & Destiny Matrix
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 mb-8 border border-purple-300 border-opacity-20">
          <label className="block text-white text-sm font-medium mb-3">
            Birth Date (YYYY-MM-DD)
          </label>
          <div className="flex gap-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 px-4 py-3 rounded bg-white bg-opacity-90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
              disabled={loading}
            />
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-500 text-white font-bold rounded transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Reading"}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 px-6 py-4 rounded mb-8">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Reports Section */}
        {reports && (
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 mb-8 border border-purple-300 border-opacity-20">
            <h2 className="text-2xl font-bold text-white mb-6">📊 System Reports</h2>

            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white bg-opacity-5 rounded-lg p-6 mb-6 border border-purple-200 border-opacity-10"
              >
                <h3 className="text-xl font-semibold text-purple-200 mb-4 capitalize">
                  {report.system_key === "astro" ? "⭐ Astrology" : "🔢 Destiny Matrix"}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {report.interpretations.slice(0, 8).map((interp, idx) => (
                    <div key={idx} className="text-sm text-gray-200">
                      <span className="font-semibold text-purple-300">
                        {interp.dimensionKey}:
                      </span>{" "}
                      {interp.valueKey}
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-400 mt-4">
                  ID: {report.id}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Synthesis Section */}
        {narrative && (
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 border border-purple-300 border-opacity-20">
            <h2 className="text-2xl font-bold text-white mb-6">✨ Unified Narrative</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-purple-100 leading-relaxed whitespace-pre-wrap">
                {narrative}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
            <p className="text-purple-200 mt-4">Generating your reading...</p>
          </div>
        )}

        {/* Instructions */}
        {!reports && !narrative && !loading && (
          <div className="bg-white bg-opacity-5 rounded-lg p-8 border border-purple-200 border-opacity-20 text-center">
            <p className="text-gray-300 mb-4">
              Enter your birth date and click "Generate Reading" to receive personalized
              insights from multiple spiritual systems.
            </p>
            <p className="text-gray-400 text-sm">
              Your reading combines Astrology (Sun/Moon/Rising) and Destiny Matrix (30+ nodes)
              into a unified narrative powered by AI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
