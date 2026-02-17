"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface BreakdownChartsProps {
  area: Record<string, number>;
  shift: Record<string, number>;
  permRelief: Record<string, number>;
}

const CHART_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
];

function BreakdownPie({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const entries = Object.entries(data)
    .filter(([k]) => k && k !== "")
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border p-5">
        <h4 className="text-sm font-semibold text-navy mb-2">{title}</h4>
        <p className="text-sm text-text-muted">No data available</p>
      </div>
    );
  }

  const chartData = entries.map(([name, value]) => ({ name, value }));
  const total = entries.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h4 className="text-sm font-semibold text-navy mb-4">{title}</h4>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={45}
              strokeWidth={2}
              stroke="#fff"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value} (${((Number(value) / total) * 100).toFixed(1)}%)`,
                name,
              ]}
              contentStyle={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px" }}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function BreakdownCharts({
  area,
  shift,
  permRelief,
}: BreakdownChartsProps) {
  return (
    <div className="report-section">
      <h3 className="text-lg font-bold font-[family-name:var(--font-display)] text-navy mb-1">
        Detailed Breakdown
      </h3>
      <p className="text-sm text-text-muted mb-4">
        Henderson Security — candidate preference distribution
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BreakdownPie title="Area Preference" data={area} />
        <BreakdownPie title="Shift Preference" data={shift} />
        <BreakdownPie title="Permanent vs Relief" data={permRelief} />
      </div>
    </div>
  );
}
