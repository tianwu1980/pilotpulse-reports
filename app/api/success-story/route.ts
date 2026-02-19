import { NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

const CLIENT_STORY_CONFIG: Record<string, { context: string; roleDescription: string; kpiNames: { siteRec: string; kiv: string } }> = {
  henderson: {
    context: "Henderson Security, a leading security services provider in Singapore",
    roleDescription: "security guards across multiple sites",
    kpiNames: { siteRec: "Site Recommendation Rate", kiv: "KIV Rate" },
  },
  call_lade: {
    context: "Call Lade HR, a logistics and haulage recruitment specialist",
    roleDescription: "logistics and haulage roles (Prime Mover Drivers, Lashing Specialists, Reefer Technicians, IGH)",
    kpiNames: { siteRec: "Eligibility Rate", kiv: "Rejection Rate" },
  },
};

export async function POST(request: Request) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { client_id, custom_instructions, benchmarks, kpis, funnel, trends, escalation, kiv, dedup_summary, period } = body;

  const sc = CLIENT_STORY_CONFIG[client_id] || CLIENT_STORY_CONFIG.henderson;

  const instructionsBlock = custom_instructions
    ? `\n\n**Additional Instructions from User:**\n${custom_instructions}\n`
    : "";

  const benchmarkBlock = benchmarks
    ? `\n**Manual Recruitment Benchmarks (for ROI calculation):**
- Cost per recruiter hour: SGD ${benchmarks.costPerRecruiterHour}
- Time to manually screen one candidate: ${benchmarks.manualScreeningMinutes} minutes
- Working hours per recruiter per day: ${benchmarks.recruiterHoursPerDay}
- Monthly recruiter salary: SGD ${benchmarks.monthlyRecruiterSalary}

Use these to calculate concrete savings:
- Hours saved = total unique conversations × manual screening minutes / 60
- Cost saved = hours saved × cost per recruiter hour
- FTE equivalent = hours saved / (working hours per day × 22 working days)\n`
    : "";

  const prompt = `You are an investor relations writer creating a compelling ROI success story for ${sc.context}'s AI-powered recruitment chatbot (PilotPulse) that recruits ${sc.roleDescription}.${instructionsBlock}

**Reporting Period:** ${period.start} to ${period.end}
**Data Summary:** ${dedup_summary.unique} unique candidates from ${dedup_summary.raw} total records

**KPIs:**
- Total Unique Conversations: ${kpis.total_unique_conversations}
- Details Completion Rate: ${kpis.details_completion_rate}%
- ${sc.kpiNames.siteRec}: ${kpis.site_recommendation_rate}%
- Conversion Rate (Booked Appointment): ${kpis.conversion_rate}%
- Human Escalation Rate: ${kpis.human_escalation_rate}%
- ${sc.kpiNames.kiv}: ${kpis.kiv_rate}%
- AI Autonomy Rate: ${kpis.ai_autonomy_rate}%

**Funnel:**
${funnel.map((f: { stage: string; count: number; dropoff_pct: number }) => `- ${f.stage}: ${f.count} candidates (${f.dropoff_pct}% drop-off)`).join("\n")}

**Trends:**
${(trends || []).map((t: { period: string; total: number; conversion_rate: number; booked: number }) => `- ${t.period}: ${t.total} conversations, ${t.conversion_rate}% conversion, ${t.booked} booked`).join("\n") || "No trend data available."}

**Escalation:** ${escalation.total} total (${escalation.rate}%)
**${sc.kpiNames.kiv}:** ${kiv.total} total (${kiv.rate}%)
${benchmarkBlock}
Generate a structured success story as a JSON object with this exact shape:
{
  "headline": "Punchy, numbers-driven headline (max 15 words)",
  "heroMetrics": [
    { "value": "85%", "label": "AI Autonomy Rate", "context": "Brief context sentence" }
  ],
  "roiSection": ${benchmarks ? `{
    "title": "Return on Investment",
    "narrative": "2-3 sentences about cost savings with specific calculated numbers",
    "savings": [
      { "metric": "Hours Saved", "value": "125 hours", "calculation": "How you calculated this" }
    ]
  }` : "null"},
  "throughputSection": {
    "title": "Throughput & Availability",
    "narrative": "2-3 sentences about volume handled, 24/7 availability, no capacity limits"
  },
  "conversionSection": {
    "title": "Conversion Efficiency",
    "narrative": "2-3 sentences about funnel efficiency and booking rate"
  },
  "autonomySection": {
    "title": "AI Autonomy",
    "narrative": "2-3 sentences about % handled without humans and cost implications"
  },
  "trendSummary": ${(trends || []).length >= 2 ? '"1-2 sentences about improvement trajectory over time"' : "null"},
  "closingStatement": "Forward-looking, confident closing sentence"
}

Guidelines:
- heroMetrics: exactly 3-4 of the most impressive numbers with brief context
- Use specific numbers throughout. Professional, data-driven, confident but not hyperbolic
- ${benchmarks ? "roiSection: show specific ROI calculations using the benchmarks provided" : "roiSection must be null since no benchmarks were provided"}
- ${(trends || []).length >= 2 ? "trendSummary: mention improvement trajectory" : "trendSummary must be null since insufficient trend data"}
- Suitable for investor presentations and pitch decks

Return ONLY the JSON object, no markdown fences or other text.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `Anthropic API error: ${response.status}`, details: err },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const story = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!story) {
      return NextResponse.json(
        { error: "Failed to parse success story from AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ story });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to generate success story: ${err instanceof Error ? err.message : "Unknown"}` },
      { status: 500 }
    );
  }
}
