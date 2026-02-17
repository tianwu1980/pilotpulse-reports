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

export interface FunnelStage {
  stage: string;
  stage_num: number;
  count: number;
  dropoff_pct: number;
  dropoff_from_previous: number;
}

export type ExcelRow = Record<string, string | number | boolean | null>;
