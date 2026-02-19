"use client";

import { useState, useCallback, useEffect } from "react";
import { format, parseISO } from "date-fns";
import ClientSelector from "./components/ClientSelector";
import DateRangePicker, { getDefaultDateRange } from "./components/DateRangePicker";
import FileUploader from "./components/FileUploader";
import KPIScorecard from "./components/KPIScorecard";
import FunnelChart from "./components/FunnelChart";
import BreakdownCharts from "./components/BreakdownCharts";
import EscalationAnalysis from "./components/EscalationAnalysis";
import KIVAnalysis from "./components/KIVAnalysis";
import TrendChart from "./components/TrendChart";
import PDFExportButton from "./components/PDFExportButton";
import SuccessStoryModal from "./components/SuccessStoryModal";
import { getClientConfig } from "./clientConfig";
import type { ReportData, ExcelRow } from "./types";

export default function Home() {
  const defaultRange = getDefaultDateRange();
  const [client, setClient] = useState("henderson");
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [rows, setRows] = useState<ExcelRow[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<{ title: string; body: string; type: string }[] | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [insightsInstructions, setInsightsInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSuccessStory, setShowSuccessStory] = useState(false);

  const handleRowsParsed = useCallback((parsedRows: ExcelRow[], names: string[]) => {
    setRows(parsedRows);
    setFileNames(names);
    setReport(null);
    setError(null);
  }, []);

  const config = getClientConfig(client);

  // Reset AI instructions when client changes
  useEffect(() => {
    setInsightsInstructions(config.defaultInsightsInstructions);
  }, [client, config.defaultInsightsInstructions]);

  const generateReport = async () => {
    if (rows.length === 0) {
      setError("Please upload at least one Excel file first.");
      return;
    }
    if (!config.webhookUrl) {
      setError(`Webhook URL not configured for ${config.name}. Check .env.local`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: client,
          start_date: startDate,
          end_date: endDate,
          rows,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
      }

      const data: ReportData = await response.json();
      setReport(data);
      setInsights(null);
      setInsightsError(null);

      // Fetch AI insights in the background
      if (!data.empty && data.trends && data.trends.length > 0) {
        setInsightsLoading(true);
        fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: client,
            custom_instructions: insightsInstructions,
            kpis: data.kpis,
            trends: data.trends,
            funnel: data.funnel,
            escalation: data.escalation,
            kiv: data.kiv,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.insights) {
              setInsights(d.insights);
            } else {
              setInsightsError(d.error || "Failed to generate insights");
            }
          })
          .catch((e) => setInsightsError(e.message || "Network error"))
          .finally(() => setInsightsLoading(false));
      }
    } catch (err) {
      setError(
        `Failed to generate report: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPeriod = (start: string, end: string) => {
    try {
      return `${format(parseISO(start), "d MMM yyyy")} – ${format(parseISO(end), "d MMM yyyy")}`;
    } catch {
      return `${start} – ${end}`;
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold font-[family-name:var(--font-display)] tracking-tight">
                PilotPulse Reports
              </h1>
              <p className="text-xs text-white/60">AI Chatbot Recruitment Analytics</p>
            </div>
          </div>
          {report && !report.empty && (
            <div className="no-print flex items-center gap-3">
              <button
                onClick={() => setShowSuccessStory(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-xl font-medium text-sm
                           hover:bg-white/20 transition-colors border border-white/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Success Story
              </button>
              <PDFExportButton
                targetId="report-container"
                fileName={`${client}-report-${startDate}-to-${endDate}`}
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls Panel */}
        <div className="no-print bg-white rounded-2xl border border-border p-6 mb-8 shadow-sm">
          <h2 className="text-base font-bold font-[family-name:var(--font-display)] text-navy mb-5">
            Report Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ClientSelector value={client} onChange={setClient} />
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />
          </div>
          {/* AI Instructions */}
          <div className="mb-6">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-navy transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showInstructions ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              AI Observations Instructions
              <span className="text-xs text-text-muted font-normal">(customize what the AI focuses on)</span>
            </button>
            {showInstructions && (
              <div className="mt-3">
                <textarea
                  value={insightsInstructions}
                  onChange={(e) => setInsightsInstructions(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-text-primary
                             focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                             transition-all resize-y font-mono leading-relaxed"
                  placeholder="Enter instructions for the AI observations..."
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-text-muted">
                    These instructions guide what the AI focuses on when generating observations.
                  </p>
                  <button
                    onClick={() => setInsightsInstructions(config.defaultInsightsInstructions)}
                    className="text-xs text-accent hover:text-accent-light transition-colors font-medium"
                  >
                    Reset to default
                  </button>
                </div>
              </div>
            )}
          </div>

          <FileUploader onRowsParsed={handleRowsParsed} />

          {/* Preview summary */}
          {rows.length > 0 && (
            <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-xl">
              <p className="text-sm text-text-primary">
                <span className="font-semibold">{rows.length}</span> raw rows loaded from{" "}
                <span className="font-semibold">{fileNames.length}</span> file{fileNames.length > 1 ? "s" : ""}.
                Ready to generate report for{" "}
                <span className="font-semibold">{formatPeriod(startDate, endDate)}</span>.
              </p>
            </div>
          )}

          {/* Generate button */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={generateReport}
              disabled={loading || rows.length === 0}
              className="px-8 py-3 bg-accent text-white rounded-xl font-semibold text-sm
                         hover:bg-accent-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                         flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Report
                </>
              )}
            </button>
            {error && <p className="text-sm text-danger">{error}</p>}
          </div>
        </div>

        {/* Report Container */}
        {report && !report.empty && (
          <div id="report-container" className="report-container space-y-6">
            {/* Section 1: Cover / Header */}
            <div className="report-section bg-navy text-white rounded-2xl p-8 animate-fade-in-up">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/60 font-medium uppercase tracking-wider mb-2">
                    Monthly Performance Report
                  </p>
                  <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-2">
                    {config.reportTitle}
                  </h2>
                  <p className="text-lg text-white/80">
                    {formatPeriod(report.period.start, report.period.end)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 mb-1">Powered by</p>
                  <p className="text-sm font-bold font-[family-name:var(--font-display)]">PilotPulse.ai</p>
                </div>
              </div>

              {/* Dedup summary */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-white/60">Raw Rows</span>{" "}
                    <span className="font-bold">{report.dedup_summary.raw}</span>
                  </div>
                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div>
                    <span className="text-white/60">In Date Range</span>{" "}
                    <span className="font-bold">{report.dedup_summary.filtered}</span>
                  </div>
                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div>
                    <span className="text-white/60">Unique Candidates</span>{" "}
                    <span className="font-bold text-accent-light">{report.dedup_summary.unique}</span>
                  </div>
                  <div className="ml-auto px-3 py-1 bg-white/10 rounded-full text-xs">
                    {report.dedup_summary.removed} duplicate{report.dedup_summary.removed !== 1 ? "s" : ""} removed
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: KPI Scorecards */}
            <div className="report-section animate-fade-in-up delay-1">
              <h3 className="text-lg font-bold font-[family-name:var(--font-display)] text-navy mb-4">
                Performance Snapshot
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KPIScorecard
                  label="Total Unique"
                  value={report.kpis.total_unique_conversations}
                  subtitle="conversations"
                  color="blue"
                  icon={<svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                />
                <KPIScorecard
                  label="Details Rate"
                  value={`${report.kpis.details_completion_rate}%`}
                  subtitle={`${report.kpis.details_completed} completed`}
                  color="green"
                  icon={<svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <KPIScorecard
                  label={config.kpiLabels.siteRecommendation.label}
                  value={`${report.kpis.site_recommendation_rate}%`}
                  subtitle={config.kpiLabels.siteRecommendation.subtitle(report.kpis.site_recommended)}
                  color="purple"
                  icon={<svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                />
                <KPIScorecard
                  label="Conversion"
                  value={`${report.kpis.conversion_rate}%`}
                  subtitle={`${report.kpis.booked_appointment} booked`}
                  color="green"
                  icon={<svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                />
                <KPIScorecard
                  label="Escalation"
                  value={`${report.kpis.human_escalation_rate}%`}
                  subtitle={`${report.kpis.escalated} escalated`}
                  color="red"
                  icon={<svg className="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                />
                <KPIScorecard
                  label={config.kpiLabels.kiv.label}
                  value={`${report.kpis.kiv_rate}%`}
                  subtitle={config.kpiLabels.kiv.subtitle(report.kpis.kiv)}
                  color="amber"
                  icon={<svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
              </div>
            </div>

            {/* Section 4: Funnel */}
            <div className="animate-fade-in-up delay-2">
              <FunnelChart
                data={report.funnel}
                total={report.kpis.total_unique_conversations}
              />
            </div>

            {/* Section 5: Breakdowns */}
            <div className="animate-fade-in-up delay-3">
              <BreakdownCharts
                area={report.breakdowns.area}
                shift={report.breakdowns.shift}
                permRelief={report.breakdowns.perm_relief}
                subtitle={config.breakdownSubtitle}
                titles={config.breakdownTitles}
              />
            </div>

            {/* Section 6: Escalation */}
            <div className="animate-fade-in-up delay-4">
              <EscalationAnalysis
                total={report.escalation.total}
                rate={report.escalation.rate}
                reasons={report.escalation.reasons}
                totalConversations={report.kpis.total_unique_conversations}
              />
            </div>

            {/* Section 7: KIV */}
            <div className="animate-fade-in-up delay-5">
              <KIVAnalysis
                total={report.kiv.total}
                rate={report.kiv.rate}
                reasons={report.kiv.reasons}
                title={config.kivSectionConfig.title}
                subtitle={config.kivSectionConfig.subtitle}
                emptyMessage={config.kivSectionConfig.emptyMessage}
              />
            </div>

            {/* Section 8: Weekly Trend */}
            <div className="animate-fade-in-up delay-5">
              <TrendChart data={report.trends || []} monthlyData={report.monthly_trends} />
            </div>

            {/* Section 9: AI Observations & Recommendations */}
            <div className="report-section bg-white rounded-2xl border border-border p-6 animate-fade-in-up delay-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold font-[family-name:var(--font-display)] text-navy">
                  Observations & Recommendations
                </h3>
                {insights && (
                  <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-semibold rounded-full uppercase tracking-wider">
                    AI Generated
                  </span>
                )}
              </div>
              <p className="text-sm text-text-muted mb-4">
                {insights ? "AI-powered insights based on your report data" : "Key insights from this reporting period"}
              </p>

              {insightsLoading ? (
                <div className="flex items-center gap-3 p-6 bg-bg rounded-xl">
                  <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  <p className="text-sm text-text-secondary">Generating AI insights from your data...</p>
                </div>
              ) : insights && insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((insight, i) => {
                    const colorMap: Record<string, { bg: string; text: string }> = {
                      positive: { bg: "bg-success/10", text: "text-success" },
                      warning: { bg: "bg-warning/10", text: "text-warning" },
                      insight: { bg: "bg-accent/10", text: "text-accent" },
                    };
                    const colors = colorMap[insight.type] || colorMap.insight;
                    return (
                      <div key={i} className="flex gap-3 p-3 bg-bg rounded-xl">
                        <div className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <span className={`text-xs font-bold ${colors.text}`}>{i + 1}</span>
                        </div>
                        <p className="text-sm text-text-primary">
                          <strong>{insight.title}</strong> — {insight.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : insightsError ? (
                <div className="p-4 bg-danger/5 border border-danger/20 rounded-xl">
                  <p className="text-sm font-medium text-danger mb-1">AI insights failed</p>
                  <p className="text-xs text-text-secondary">{insightsError}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {report.kpis.conversion_rate > 0 && (
                    <div className="flex gap-3 p-3 bg-bg rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-accent">1</span>
                      </div>
                      <p className="text-sm text-text-primary">
                        <strong>Conversion Rate at {report.kpis.conversion_rate}%</strong> —{" "}
                        {report.kpis.booked_appointment} out of {report.kpis.total_unique_conversations} unique
                        candidates booked an appointment.
                        {report.kpis.conversion_rate >= 20
                          ? " This is a strong conversion rate."
                          : " There may be opportunity to improve the booking flow."}
                      </p>
                    </div>
                  )}
                  {report.kpis.ai_autonomy_rate > 0 && (
                    <div className="flex gap-3 p-3 bg-bg rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-success">2</span>
                      </div>
                      <p className="text-sm text-text-primary">
                        <strong>AI Autonomy at {report.kpis.ai_autonomy_rate}%</strong> — The chatbot handled{" "}
                        {report.kpis.total_unique_conversations - report.kpis.escalated} conversations
                        without human intervention.
                      </p>
                    </div>
                  )}
                  {report.funnel.length > 1 && (
                    <div className="flex gap-3 p-3 bg-bg rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">3</span>
                      </div>
                      <p className="text-sm text-text-primary">
                        <strong>Biggest funnel drop-off</strong> —{" "}
                        {(() => {
                          const maxDrop = report.funnel.slice(1).reduce((max, s) =>
                            s.dropoff_pct > max.dropoff_pct ? s : max
                          );
                          const prevIdx = report.funnel.findIndex(
                            (s) => s.stage_num === maxDrop.stage_num - 1
                          );
                          return `${maxDrop.dropoff_pct}% drop from "${report.funnel[prevIdx]?.stage}" to "${maxDrop.stage}" (${maxDrop.dropoff_from_previous} candidates lost).`;
                        })()}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-text-muted italic mt-2">
                    Add ANTHROPIC_API_KEY to your environment to enable AI-powered insights.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="report-section text-center py-6 border-t border-border-light">
              <p className="text-xs text-text-muted">
                Report generated on {format(new Date(), "d MMM yyyy, HH:mm")} | PilotPulse.ai | Confidential
              </p>
            </div>
          </div>
        )}

        {/* Empty state after generation */}
        {report?.empty && (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">No Data for This Period</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              {report.message || "No records found in the selected date range. Try adjusting the start and end dates."}
            </p>
          </div>
        )}
      </main>

      {report && !report.empty && (
        <SuccessStoryModal
          isOpen={showSuccessStory}
          onClose={() => setShowSuccessStory(false)}
          report={report}
          clientId={client}
        />
      )}
    </div>
  );
}
