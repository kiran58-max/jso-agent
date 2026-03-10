// ── Mock post-session report ───────────────────────────────────────────────
// Realistic Claude-style output for the full session between Marcus & Priya.

const MOCK_REPORT = {
  session_summary: "Marcus conducted a career transition consultation with Priya, a software engineer exploring product management. The session covered her background, qualification concerns, portfolio structuring, and how to present her A/B testing experience. Quality improved significantly in the second half after an early section where discouraging generalisations were made about engineer-to-PM transitions.",
  overall_tone_score: 77,
  overall_professionalism_score: 81,
  overall_engagement_score: 78,
  strengths: [
    "Delivered highly specific, actionable portfolio advice — the 'problem → approach → business outcome' framework is exactly what candidates need and was clearly communicated.",
    "Showed genuine recognition of Priya's A/B testing achievement and connected it directly to PM hiring panel expectations.",
    "Strong closing energy — the session ended on a constructive, empowering note that left the candidate with a clear path forward."
  ],
  development_areas: [
    "Avoid generalisations about failure rates in career transitions — statements like 'many engineers fail' undermine candidate confidence and are flagged as non-compliant with JSO supportive consultation standards.",
    "When a candidate expresses a specific goal (portfolio guidance), defer to that topic before introducing platform services — candidate-led sessions produce higher satisfaction scores."
  ],
  candidate_outcome: "positive",
  compliance_status: "review_needed",
  coaching_card: [
    "Open every session by aligning on the candidate's stated goal and returning to it at each transition point. This keeps engagement high and prevents the conversation from drifting toward services they didn't ask for.",
    "Replace discouraging statistics with empowering reframes. Instead of 'many engineers fail at this,' try 'engineers who succeed in PM roles typically do X — let's map your experience to that.' Same message, completely different effect on candidate confidence.",
    "Your domain knowledge is excellent — the portfolio framework you gave was outstanding. Deliver that quality of advice earlier and more consistently, and your overall session scores will move from good to exceptional."
  ],
  recommended_next_steps: [
    "Build 2–3 PM case studies using the Problem → Approach → Business Outcome structure, leading with the A/B testing framework as the flagship piece.",
    "Complete one mock PM case interview (use frameworks like CIRCLES or HEART) and record it to self-review communication of non-technical decisions.",
    "Apply to 3 APM or Associate PM roles at product-led companies where engineering background is explicitly valued — JSO's placement team can provide a shortlist."
  ]
};

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  // Simulate Claude thinking time: 2–3 seconds
  setTimeout(() => res.status(200).json(MOCK_REPORT), 2000 + Math.random() * 1000);
}
