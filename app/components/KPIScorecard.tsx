"use client";

interface KPIScorecardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "amber" | "red" | "purple";
}

const COLOR_MAP = {
  blue: { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  green: { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
  amber: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
  red: { bg: "bg-danger/10", text: "text-danger", border: "border-danger/20" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
};

export default function KPIScorecard({
  label,
  value,
  subtitle,
  icon,
  color = "blue",
}: KPIScorecardProps) {
  const c = COLOR_MAP[color];

  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-5 flex flex-col gap-3 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        {icon && (
          <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold font-[family-name:var(--font-display)] ${c.text}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-text-muted mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
