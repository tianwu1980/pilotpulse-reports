"use client";

interface KIVAnalysisProps {
  total: number;
  rate: number;
  reasons: Record<string, number>;
}

export default function KIVAnalysis({ total, rate, reasons }: KIVAnalysisProps) {
  const sorted = Object.entries(reasons)
    .filter(([k]) => k && k !== "" && k !== "Not specified")
    .sort((a, b) => b[1] - a[1]);

  const notSpecified = reasons["Not specified"] || 0;

  return (
    <div className="report-section bg-white rounded-2xl border border-border p-6">
      <h3 className="text-lg font-bold font-[family-name:var(--font-display)] text-navy mb-1">
        KIV Analysis
      </h3>
      <p className="text-sm text-text-muted mb-6">
        Candidates marked as &quot;Keep In View&quot; — pending follow-up
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-bg rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-warning">{total}</p>
          <p className="text-xs text-text-muted mt-1">Total KIV</p>
        </div>
        <div className="bg-bg rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-warning">{rate}%</p>
          <p className="text-xs text-text-muted mt-1">KIV Rate</p>
        </div>
      </div>

      {sorted.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-secondary mb-3">KIV Reasons</h4>
          <div className="space-y-2">
            {sorted.map(([reason, count]) => {
              const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
              return (
                <div key={reason} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-primary truncate">{reason}</span>
                      <span className="text-text-muted ml-2">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-border-light rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning/60 rounded-full transition-all"
                        style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {notSpecified > 0 && (
              <p className="text-xs text-text-muted mt-2">
                + {notSpecified} KIV{notSpecified > 1 ? "s" : ""} with no reason specified
              </p>
            )}
          </div>
        </div>
      )}

      {total === 0 && (
        <p className="text-sm text-success font-medium">
          No KIV candidates in this period.
        </p>
      )}
    </div>
  );
}
