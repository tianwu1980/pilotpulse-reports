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
  successStoryContext: {
    roleDescription: string;
    companyContext: string;
    defaultBenchmarks: {
      costPerRecruiterHour: number;
      manualScreeningMinutes: number;
      recruiterHoursPerDay: number;
      monthlyRecruiterSalary: number;
    };
    defaultInstructions: string;
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
    successStoryContext: {
      roleDescription: "security guards across multiple sites in Singapore",
      companyContext: "Henderson Security, a leading security services provider in Singapore",
      defaultBenchmarks: {
        costPerRecruiterHour: 25,
        manualScreeningMinutes: 30,
        recruiterHoursPerDay: 8,
        monthlyRecruiterSalary: 4000,
      },
      defaultInstructions: `Write an investor-facing success story for Henderson Security's AI-powered recruitment chatbot (PilotPulse) that screens security guard candidates.

Focus on: cost savings from AI-driven screening, 24/7 availability replacing manual recruiter hours, conversion efficiency from chatbot to booked appointments, AI autonomy rate, and scalability across multiple security sites.

Tone: professional, data-driven, confident but not hyperbolic. Suitable for investor presentations.`,
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
    successStoryContext: {
      roleDescription: "logistics and haulage roles (Prime Mover Drivers, Lashing Specialists, Reefer Technicians, IGH)",
      companyContext: "Call Lade HR, a logistics and haulage recruitment specialist",
      defaultBenchmarks: {
        costPerRecruiterHour: 28,
        manualScreeningMinutes: 35,
        recruiterHoursPerDay: 8,
        monthlyRecruiterSalary: 4500,
      },
      defaultInstructions: `Write an investor-facing success story for Call Lade HR's AI-powered recruitment chatbot (PilotPulse) that screens logistics and haulage candidates (Prime Mover Drivers, Lashing Specialists, Reefer Technicians, IGH).

Focus on: cost savings from AI-driven screening, 24/7 availability, eligibility pre-screening efficiency, conversion from chatbot to booked appointments, and scalability across multiple logistics roles.

Tone: professional, data-driven, confident but not hyperbolic. Suitable for investor presentations.`,
    },
  },
};

export function getClientConfig(clientId: string): ClientConfig {
  return CLIENT_CONFIGS[clientId] || CLIENT_CONFIGS.henderson;
}
