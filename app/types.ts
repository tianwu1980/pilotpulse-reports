export interface ReportData {
  client: string;
  period: { start: string; end: string };
  dedup_summary: {
    raw: number;
    filtered: number;
    unique: number;
    removed: number;
  };
  empty?: boolean;
  message?: string;
  kpis: {
    total_unique_conversations: number;
    details_completion_rate: number;
    site_recommendation_rate: number;
    conversion_rate: number;
    human_escalation_rate: number;
    kiv_rate: number;
    ai_autonomy_rate: number;
    details_completed: number;
    site_recommended: number;
    booked_appointment: number;
    escalated: number;
    kiv: number;
  };
  funnel: FunnelStage[];
  trends?: TrendPoint[];
  monthly_trends?: TrendPoint[];
  breakdowns: {
    area: Record<string, number>;
    shift: Record<string, number>;
    perm_relief: Record<string, number>;
    floater: { yes: number; no: number };
  };
  escalation: {
    total: number;
    rate: number;
    reasons: Record<string, number>;
  };
  kiv: {
    total: number;
    rate: number;
    reasons: Record<string, number>;
  };
}

export interface TrendPoint {
  period: string;
  week_start: string;
  total: number;
  conversion_rate: number;
  details_rate: number;
  escalation_rate: number;
  booked: number;
}

export interface FunnelStage {
  stage: string;
  stage_num: number;
  count: number;
  dropoff_pct: number;
  dropoff_from_previous: number;
}

export type ExcelRow = Record<string, string | number | boolean | null>;

export interface BenchmarkInputs {
  costPerRecruiterHour: number | null;
  manualScreeningMinutes: number | null;
  recruiterHoursPerDay: number | null;
  monthlyRecruiterSalary: number | null;
}

export interface SuccessStory {
  headline: string;
  heroMetrics: { value: string; label: string; context: string }[];
  roiSection: {
    title: string;
    narrative: string;
    savings: { metric: string; value: string; calculation: string }[];
  } | null;
  throughputSection: { title: string; narrative: string };
  conversionSection: { title: string; narrative: string };
  autonomySection: { title: string; narrative: string };
  trendSummary: string | null;
  closingStatement: string;
}
