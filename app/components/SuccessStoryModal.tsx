"use client";

import { useState, useEffect, useCallback } from "react";
import { getClientConfig } from "../clientConfig";
import type { ReportData, BenchmarkInputs, SuccessStory } from "../types";

type Step = "setup" | "generating" | "display";

interface SuccessStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportData;
  clientId: string;
}

export default function SuccessStoryModal({ isOpen, onClose, report, clientId }: SuccessStoryModalProps) {
  const config = getClientConfig(clientId);
  const defaults = config.successStoryContext.defaultBenchmarks;

  const [step, setStep] = useState<Step>("setup");
  const [benchmarks, setBenchmarks] = useState<BenchmarkInputs>({
    costPerRecruiterHour: defaults.costPerRecruiterHour,
    manualScreeningMinutes: defaults.manualScreeningMinutes,
    recruiterHoursPerDay: defaults.recruiterHoursPerDay,
    monthlyRecruiterSalary: defaults.monthlyRecruiterSalary,
  });
  const [instructions, setInstructions] = useState(config.successStoryContext.defaultInstructions);
  const [showInstructions, setShowInstructions] = useState(false);
  const [story, setStory] = useState<SuccessStory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset state when modal opens or client changes
  useEffect(() => {
    if (isOpen) {
      setStep("setup");
      setStory(null);
      setError(null);
      setCopied(false);
      const d = getClientConfig(clientId).successStoryContext;
      setBenchmarks({
        costPerRecruiterHour: d.defaultBenchmarks.costPerRecruiterHour,
        manualScreeningMinutes: d.defaultBenchmarks.manualScreeningMinutes,
        recruiterHoursPerDay: d.defaultBenchmarks.recruiterHoursPerDay,
        monthlyRecruiterSalary: d.defaultBenchmarks.monthlyRecruiterSalary,
      });
      setInstructions(d.defaultInstructions);
    }
  }, [isOpen, clientId]);

  // Escape key closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const generate = useCallback(async (includeBenchmarks: boolean) => {
    setStep("generating");
    setError(null);

    try {
      const res = await fetch("/api/success-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          custom_instructions: instructions,
          benchmarks: includeBenchmarks ? benchmarks : null,
          kpis: report.kpis,
          funnel: report.funnel,
          trends: report.trends,
          escalation: report.escalation,
          kiv: report.kiv,
          dedup_summary: report.dedup_summary,
          period: report.period,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate success story");
        setStep("setup");
        return;
      }

      setStory(data.story);
      setStep("display");
    } catch {
      setError("Network error. Please try again.");
      setStep("setup");
    }
  }, [clientId, instructions, benchmarks, report]);

  const copyToClipboard = useCallback(() => {
    if (!story) return;

    const lines: string[] = [
      story.headline,
      "",
      "KEY METRICS",
      ...story.heroMetrics.map(m => `  ${m.label}: ${m.value} — ${m.context}`),
      "",
    ];

    if (story.roiSection) {
      lines.push(story.roiSection.title.toUpperCase());
      lines.push(story.roiSection.narrative);
      lines.push("");
      story.roiSection.savings.forEach(s => {
        lines.push(`  ${s.metric}: ${s.value} (${s.calculation})`);
      });
      lines.push("");
    }

    lines.push(story.throughputSection.title.toUpperCase());
    lines.push(story.throughputSection.narrative);
    lines.push("");
    lines.push(story.conversionSection.title.toUpperCase());
    lines.push(story.conversionSection.narrative);
    lines.push("");
    lines.push(story.autonomySection.title.toUpperCase());
    lines.push(story.autonomySection.narrative);

    if (story.trendSummary) {
      lines.push("");
      lines.push("TRENDS");
      lines.push(story.trendSummary);
    }

    lines.push("");
    lines.push(story.closingStatement);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [story]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Setup Step */}
        {step === "setup" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-navy">
                  Generate Success Story
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Create an investor-ready narrative from your report data
                </p>
              </div>
              <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger">
                {error}
              </div>
            )}

            {/* Instructions */}
            <div className="mb-6">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-2 text-sm font-medium text-navy hover:text-accent transition-colors"
              >
                <svg className={`w-4 h-4 transition-transform ${showInstructions ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                AI Instructions
              </button>
              {showInstructions && (
                <div className="mt-3">
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary
                               focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y"
                  />
                  <button
                    onClick={() => setInstructions(config.successStoryContext.defaultInstructions)}
                    className="mt-1 text-xs text-text-muted hover:text-accent transition-colors"
                  >
                    Reset to default
                  </button>
                </div>
              )}
            </div>

            {/* Benchmarks */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-navy mb-1">ROI Benchmarks</h3>
              <p className="text-xs text-text-secondary mb-4">
                Enter your manual recruitment costs to calculate concrete ROI savings
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Cost per recruiter hour (SGD)
                  </label>
                  <input
                    type="number"
                    value={benchmarks.costPerRecruiterHour ?? ""}
                    onChange={(e) => setBenchmarks({ ...benchmarks, costPerRecruiterHour: e.target.value ? Number(e.target.value) : null })}
                    placeholder={String(defaults.costPerRecruiterHour)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Manual screening time (min/candidate)
                  </label>
                  <input
                    type="number"
                    value={benchmarks.manualScreeningMinutes ?? ""}
                    onChange={(e) => setBenchmarks({ ...benchmarks, manualScreeningMinutes: e.target.value ? Number(e.target.value) : null })}
                    placeholder={String(defaults.manualScreeningMinutes)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Recruiter hours per day
                  </label>
                  <input
                    type="number"
                    value={benchmarks.recruiterHoursPerDay ?? ""}
                    onChange={(e) => setBenchmarks({ ...benchmarks, recruiterHoursPerDay: e.target.value ? Number(e.target.value) : null })}
                    placeholder={String(defaults.recruiterHoursPerDay)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Monthly recruiter salary (SGD)
                  </label>
                  <input
                    type="number"
                    value={benchmarks.monthlyRecruiterSalary ?? ""}
                    onChange={(e) => setBenchmarks({ ...benchmarks, monthlyRecruiterSalary: e.target.value ? Number(e.target.value) : null })}
                    placeholder={String(defaults.monthlyRecruiterSalary)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                onClick={() => generate(false)}
                className="text-sm text-text-secondary hover:text-accent transition-colors"
              >
                Skip benchmarks — generate without ROI
              </button>
              <button
                onClick={() => generate(true)}
                className="px-5 py-2.5 bg-accent text-white rounded-xl font-medium text-sm
                           hover:bg-accent-light transition-colors"
              >
                Generate with ROI
              </button>
            </div>
          </div>
        )}

        {/* Generating Step */}
        {step === "generating" && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-navy">Generating your success story...</p>
            <p className="text-xs text-text-muted mt-1">This may take a few seconds</p>
          </div>
        )}

        {/* Display Step */}
        {step === "display" && story && (
          <div>
            {/* Header band */}
            <div className="bg-gradient-to-r from-navy to-navy-light text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                {config.name} — Success Story
              </div>
              <h2 className="text-xl font-bold font-[family-name:var(--font-display)] leading-tight">
                {story.headline}
              </h2>
              <p className="text-sm text-white/60 mt-2">
                {report.period.start} to {report.period.end}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Hero Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {story.heroMetrics.map((m, i) => (
                  <div key={i} className="bg-bg rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-navy font-[family-name:var(--font-display)]">
                      {m.value}
                    </div>
                    <div className="text-xs font-semibold text-text-secondary mt-1">{m.label}</div>
                    <div className="text-xs text-text-muted mt-0.5">{m.context}</div>
                  </div>
                ))}
              </div>

              {/* ROI Section */}
              {story.roiSection && (
                <div className="bg-success/5 border border-success/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-navy">{story.roiSection.title}</h3>
                  </div>
                  <p className="text-sm text-text-primary mb-4">{story.roiSection.narrative}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {story.roiSection.savings.map((s, i) => (
                      <div key={i} className="bg-white rounded-lg p-3">
                        <div className="text-lg font-bold text-success">{s.value}</div>
                        <div className="text-xs font-semibold text-text-secondary">{s.metric}</div>
                        <div className="text-xs text-text-muted mt-1">{s.calculation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Narrative Sections */}
              {[story.throughputSection, story.conversionSection, story.autonomySection].map((section, i) => {
                const colors = [
                  { border: "border-accent", bg: "bg-accent/10", text: "text-accent" },
                  { border: "border-warning", bg: "bg-warning/10", text: "text-warning" },
                  { border: "border-navy", bg: "bg-navy/10", text: "text-navy" },
                ];
                const icons = [
                  <path key="0" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
                  <path key="1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
                  <path key="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                ];
                const c = colors[i];

                return (
                  <div key={i} className={`border-l-4 ${c.border} pl-4 py-1`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-md ${c.bg} flex items-center justify-center`}>
                        <svg className={`w-3.5 h-3.5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {icons[i]}
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-navy">{section.title}</h3>
                    </div>
                    <p className="text-sm text-text-primary leading-relaxed">{section.narrative}</p>
                  </div>
                );
              })}

              {/* Trend Summary */}
              {story.trendSummary && (
                <div className="bg-bg rounded-xl p-4">
                  <p className="text-sm text-text-secondary italic">{story.trendSummary}</p>
                </div>
              )}

              {/* Closing */}
              <div className="text-center pt-2 pb-1">
                <p className="text-sm font-medium text-navy italic">
                  &ldquo;{story.closingStatement}&rdquo;
                </p>
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button
                  onClick={() => setStep("setup")}
                  className="text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  Regenerate
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-medium
                               hover:bg-navy-light transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {copied ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      )}
                    </svg>
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-border rounded-xl text-sm font-medium text-text-secondary
                               hover:bg-bg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
