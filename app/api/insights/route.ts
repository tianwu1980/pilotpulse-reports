import { NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

const CLIENT_INSIGHTS: Record<string, { context: string; kpiNames: { siteRec: string; kiv: string }; focus: string }> = {
  henderson: {
    context: "Henderson Security's AI chatbot recruitment system (PilotPulse) for security guard recruitment",
    kpiNames: { siteRec: "Site Recommendation Rate", kiv: "KIV Rate" },
    focus: "conversion improvement, escalation reduction, trend patterns, funnel bottlenecks, KIV follow-up potential",
  },
  call_lade: {
    context: "Call Lade HR's AI chatbot recruitment system (PilotPulse) for logistics and haulage roles (Prime Mover Driver, Lashing Specialist, Reefer Technician, IGH)",
    kpiNames: { siteRec: "Eligibility Rate", kiv: "Rejection Rate" },
    focus: "conversion improvement, eligibility criteria optimization, escalation reduction, trend patterns, rejection analysis",
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
  const { client_id, custom_instructions, kpis, trends, funnel, escalation, kiv } = body;

  const ic = CLIENT_INSIGHTS[client_id] || CLIENT_INSIGHTS.henderson;

  const instructionsBlock = custom_instructions
    ? `\n\n**Additional Instructions from User:**\n${custom_instructions}\n`
    : "";

  const prompt = `You are a recruitment analytics consultant analyzing performance data for ${ic.context}.${instructionsBlock}

Here is the data for this reporting period:

**KPIs:**
- Total Unique Conversations: ${kpis.total_unique_conversations}
- Details Completion Rate: ${kpis.details_completion_rate}%
- ${ic.kpiNames.siteRec}: ${kpis.site_recommendation_rate}%
- Conversion Rate (Booked Appointment): ${kpis.conversion_rate}%
- Human Escalation Rate: ${kpis.human_escalation_rate}%
- ${ic.kpiNames.kiv}: ${kpis.kiv_rate}%
- AI Autonomy Rate: ${kpis.ai_autonomy_rate}%

**Funnel Stages:**
${funnel.map((f: { stage: string; count: number; dropoff_pct: number }) => `- ${f.stage}: ${f.count} candidates (${f.dropoff_pct}% drop-off)`).join("\n")}

**Weekly Trends:**
${trends.map((t: { period: string; total: number; conversion_rate: number; details_rate: number; escalation_rate: number; booked: number }) => `- ${t.period}: ${t.total} conversations, ${t.conversion_rate}% conversion, ${t.details_rate}% details, ${t.escalation_rate}% escalation, ${t.booked} booked`).join("\n")}

**Escalation:** ${escalation.total} total (${escalation.rate}%)
Top reasons: ${Object.entries(escalation.reasons).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([reason, count]) => `${reason} (${count})`).join(", ")}

**${ic.kpiNames.kiv}:** ${kiv.total} total (${kiv.rate}%)
Top reasons: ${Object.entries(kiv.reasons).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([reason, count]) => `${reason} (${count})`).join(", ")}

Based on this data, provide exactly 5 actionable observations and recommendations. Each should:
1. Reference specific numbers and trends from the data
2. Identify what's working well OR what needs improvement
3. Suggest a concrete action to take

Focus on: ${ic.focus}.

Return your response as a JSON array of exactly 5 objects with this structure:
[{"title": "Short headline", "body": "2-3 sentence analysis with specific numbers and a concrete recommendation.", "type": "positive|warning|insight"}]

Only return the JSON array, no other text.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
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
    const text = data.content?.[0]?.text || "[]";

    // Parse the JSON from Claude's response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ insights });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to generate insights: ${err instanceof Error ? err.message : "Unknown"}` },
      { status: 500 }
    );
  }
}
