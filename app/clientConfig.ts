export interface ClientConfig {
  id: string;
  name: string;
  industry: string;
  webhookUrl: string;
  reportTitle: string;
  breakdownSubtitle: string;
  breakdownTitles: [string, string, string];
  kpiLabels: {
    siteRecommendation: { label: string; subtitle: (count: number) => string };
    kiv: { label: string; subtitle: (count: number) => string };
  };
  insightsContext: string;
  insightsFocus: string;
  insightsKpiNames: { siteRec: string; kiv: string };
  defaultInsightsInstructions: string;
  kivSectionConfig: {
    title: string;
    subtitle: string;
    emptyMessage: string;
  };
}

export const CLIENT_CONFIGS: Record<string, ClientConfig> = {
  henderson: {
    id: "henderson",
    name: "Henderson Security",
    industry: "Security Services",
    webhookUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL_HENDERSON || "",
    reportTitle: "Henderson Security",
    breakdownSubtitle: "Henderson Security — candidate preference distribution",
    breakdownTitles: ["Area Preference", "Shift Preference", "Permanent vs Relief"],
    kpiLabels: {
      siteRecommendation: {
        label: "Site Rec. Rate",
        subtitle: (n) => `${n} recommended`,
      },
      kiv: {
        label: "KIV Rate",
        subtitle: (n) => `${n} candidates`,
      },
    },
    insightsContext:
      "Henderson Security's AI chatbot recruitment system (PilotPulse) for security guard recruitment",
    insightsFocus:
      "conversion improvement, escalation reduction, trend patterns, funnel bottlenecks, KIV follow-up potential",
    insightsKpiNames: { siteRec: "Site Recommendation Rate", kiv: "KIV Rate" },
    defaultInsightsInstructions: `You are analyzing Henderson Security's AI chatbot recruitment system (PilotPulse) for security guard recruitment.

Focus on: conversion improvement, escalation reduction, trend patterns across weeks, funnel bottlenecks, and KIV follow-up potential.

Provide actionable recommendations that help improve the chatbot's recruitment performance.`,
    kivSectionConfig: {
      title: "KIV Analysis",
      subtitle: 'Candidates marked as "Keep In View" — pending follow-up',
      emptyMessage: "No KIV candidates in this period.",
    },
  },
  call_lade: {
    id: "call_lade",
    name: "Call Lade HR",
    industry: "Logistics & Haulage",
    webhookUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL_CALLLADE || "",
    reportTitle: "Call Lade HR",
    breakdownSubtitle: "Call Lade HR — candidate distribution",
    breakdownTitles: ["Job Title", "Need Work Pass", "Eligibility Status"],
    kpiLabels: {
      siteRecommendation: {
        label: "Eligibility Rate",
        subtitle: (n) => `${n} eligible`,
      },
      kiv: {
        label: "Rejection Rate",
        subtitle: (n) => `${n} rejected`,
      },
    },
    insightsContext:
      "Call Lade HR's AI chatbot recruitment system (PilotPulse) for logistics roles (Prime Mover Driver, Lashing Specialist, Reefer Technician, IGH)",
    insightsFocus:
      "conversion improvement, eligibility criteria optimization, escalation reduction, trend patterns, rejection analysis",
    insightsKpiNames: { siteRec: "Eligibility Rate", kiv: "Rejection Rate" },
    defaultInsightsInstructions: `You are analyzing Call Lade HR's AI chatbot recruitment system (PilotPulse) for logistics and haulage roles (Prime Mover Driver, Lashing Specialist, Reefer Technician, IGH).

Focus on: conversion improvement, eligibility criteria optimization, escalation reduction, trend patterns, and rejection analysis.

Provide actionable recommendations that help improve the chatbot's recruitment performance for logistics roles.`,
    kivSectionConfig: {
      title: "Rejection Analysis",
      subtitle: 'Candidates marked as "Rejected" — did not meet eligibility criteria',
      emptyMessage: "No rejected candidates in this period.",
    },
  },
};

export function getClientConfig(clientId: string): ClientConfig {
  return CLIENT_CONFIGS[clientId] || CLIENT_CONFIGS.henderson;
}
