// ── Mock AI responses ──────────────────────────────────────────────────────
// Simulates what Claude would realistically return for each HR utterance.
// Scores vary authentically based on utterance content — not random.

const MOCK_RESPONSES = [
  { tone_score:82, professionalism_score:88, engagement_score:65, flag_risk:0.05, flag_reason:null, coaching_hint:null, sentiment:"positive" },
  { tone_score:68, professionalism_score:74, engagement_score:72, flag_risk:0.28, flag_reason:null, coaching_hint:"Consider framing qualification questions more encouragingly — ask what skills they're building rather than questioning readiness.", sentiment:"neutral" },
  { tone_score:54, professionalism_score:61, engagement_score:68, flag_risk:0.64, flag_reason:"Generalisation about engineer failure rates may discourage the candidate and is not aligned with JSO's supportive consultation standards.", coaching_hint:"Reframe challenges as growth opportunities rather than common failure patterns — lead with empowerment.", sentiment:"concerning" },
  { tone_score:73, professionalism_score:79, engagement_score:60, flag_risk:0.22, flag_reason:null, coaching_hint:"Candidate asked about portfolio guidance — ensure placement services are mentioned as a supplement, not a redirect from their stated goal.", sentiment:"neutral" },
  { tone_score:91, professionalism_score:93, engagement_score:86, flag_risk:0.03, flag_reason:null, coaching_hint:null, sentiment:"positive" },
  { tone_score:94, professionalism_score:92, engagement_score:90, flag_risk:0.02, flag_reason:null, coaching_hint:null, sentiment:"positive" },
];

let callCount = 0;

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const idx = Math.min(callCount, MOCK_RESPONSES.length - 1);
  callCount++;
  // Realistic delay: 900ms–1.5s
  setTimeout(() => res.status(200).json(MOCK_RESPONSES[idx]), 900 + Math.random() * 600);
}
