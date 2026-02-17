"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { FunnelStage } from "../types";

interface FunnelChartProps {
  data: FunnelStage[];
  total: number;
}

const COLORS = ["#3b82f6", "#60a5fa", "#10b981", "#f59e0b", "#8b5cf6"];

export default function FunnelChart({ data, total }: FunnelChartProps) {
  const chartData = data.map((stage, i) => ({
    name: stage.stage,
    count: stage.count,
    pct: total > 0 ? ((stage.count / total) * 100).toFixed(1) : "0",
    dropoff: stage.dropoff_pct,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="report-section bg-white rounded-2xl border border-border p-6">
      <h3 className="text-lg font-bold font-[family-name:var(--font-display)] text-navy mb-1">
        Recruitment Funnel
      </h3>
      <p className="text-sm text-text-muted mb-6">
        Candidates progressing through each stage (cumulative)
      </p>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#0f172a" }}
              width={180}
            />
            <Tooltip
              formatter={(value, _name, props) => [
                `${value} (${(props as { payload: { pct: string } }).payload.pct}%)`,
                "Count",
              ]}
              contentStyle={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "13px",
              }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                style={{ fontSize: 12, fontWeight: 600, fill: "#0f172a" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Drop-off table */}
      <div className="mt-6 border-t border-border-light pt-4">
        <h4 className="text-sm font-semibold text-text-secondary mb-3">Stage Drop-off Analysis</h4>
        <div className="grid gap-2">
          {data.slice(1).map((stage, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1">
              <span className="text-text-secondary">
                {data[i].stage} → {stage.stage}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-text-muted">
                  {stage.dropoff_from_previous} dropped
                </span>
                <span className={`font-semibold ${stage.dropoff_pct > 50 ? "text-danger" : stage.dropoff_pct > 30 ? "text-warning" : "text-success"}`}>
                  {stage.dropoff_pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
