"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Bar,
  ComposedChart,
} from "recharts";
import type { TrendPoint } from "../types";

interface TrendChartProps {
  data: TrendPoint[];
  monthlyData?: TrendPoint[];
}

type ViewMode = "week" | "month";

export default function TrendChart({ data, monthlyData }: TrendChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  const activeData = viewMode === "month" && monthlyData ? monthlyData : data;
  const periodLabel = viewMode === "month" ? "Monthly" : "Weekly";

  if (activeData.length < 2) {
    return (
      <div className="report-section bg-white rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold font-[family-name:var(--font-display)] text-navy mb-1">
          Period-on-Period Trend
        </h3>
        <p className="text-sm text-text-muted mb-4">
          Historical comparison across reporting periods
        </p>
        <div className="flex items-center justify-center h-32 bg-bg rounded-xl border border-border-light">
          <p className="text-sm text-text-muted">
            {activeData.length === 1
              ? `Only 1 ${viewMode} of data found. Upload files spanning multiple ${viewMode}s to see trends.`
              : `No ${viewMode}ly data available. Ensure your uploads cover at least 2 ${viewMode}s.`}
          </p>
        </div>
      </div>
    );
  }

  const chartData = activeData.map((d) => ({
    name: d.period,
    "Conversations": d.total,
    "Conversion %": d.conversion_rate,
    "Details %": d.details_rate,
    "Escalation %": d.escalation_rate,
    "Booked": d.booked,
  }));

  return (
    <div className="report-section bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold font-[family-name:var(--font-display)] text-navy">
          Period-on-Period Trend
        </h3>
        {/* Week / Month toggle */}
        <div className="flex items-center gap-1 bg-bg rounded-lg p-0.5 no-print">
          <button
            onClick={() => setViewMode("week")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === "week"
                ? "bg-white text-navy shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === "month"
                ? "bg-white text-navy shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      <p className="text-sm text-text-muted mb-6">
        {periodLabel} performance across the reporting period
      </p>

      {/* Volume chart */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-text-secondary mb-3">
          {periodLabel} Volume
        </h4>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" iconSize={8} />
              <Bar
                yAxisId="left"
                dataKey="Conversations"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                barSize={36}
                opacity={0.8}
              />
              <Bar
                yAxisId="left"
                dataKey="Booked"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                barSize={36}
                opacity={0.8}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rate chart */}
      <div>
        <h4 className="text-sm font-semibold text-text-secondary mb-3">
          {periodLabel} Rates
        </h4>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value) => [`${value}%`]}
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" iconSize={8} />
              <Line
                type="monotone"
                dataKey="Conversion %"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#10b981" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Details %"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Escalation %"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#ef4444" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary table */}
      <div className="mt-6 border-t border-border-light pt-4">
        <h4 className="text-sm font-semibold text-text-secondary mb-3">{periodLabel} Summary</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-border-light">
                <th className="py-2 pr-4 font-medium">{viewMode === "month" ? "Month" : "Week"}</th>
                <th className="py-2 px-3 font-medium text-right">Conversations</th>
                <th className="py-2 px-3 font-medium text-right">Booked</th>
                <th className="py-2 px-3 font-medium text-right">Conversion</th>
                <th className="py-2 px-3 font-medium text-right">Details</th>
                <th className="py-2 pl-3 font-medium text-right">Escalation</th>
              </tr>
            </thead>
            <tbody>
              {activeData.map((row, i) => (
                <tr key={i} className="border-b border-border-light last:border-0">
                  <td className="py-2 pr-4 text-text-primary font-medium">{row.period}</td>
                  <td className="py-2 px-3 text-right">{row.total}</td>
                  <td className="py-2 px-3 text-right text-success font-semibold">{row.booked}</td>
                  <td className="py-2 px-3 text-right">{row.conversion_rate}%</td>
                  <td className="py-2 px-3 text-right">{row.details_rate}%</td>
                  <td className="py-2 pl-3 text-right">{row.escalation_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
