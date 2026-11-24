export type VentureAdvisorId = 'jarvis' | 'friday' | 'edith' | 'dume' | 'ultron';

interface VenturePlaybookEntry {
  id: string;
  title: string;
  advisors: VentureAdvisorId[];
  stages: string[];
  keywords: string[];
  guidance: string;
}

// Compact, practical reference notes retrieved into each advisor's prompt.
// Keep these as reusable principles, not claims that fit every company or market.
const VENTURE_PLAYBOOK: VenturePlaybookEntry[] = [
  {
    id: 'stage-and-focus', title: 'Choose the right next stage gate', advisors: ['jarvis', 'friday', 'edith', 'ultron'],
    stages: ['idea', 'architecture', 'validation', 'mvp', 'prototype'],
    keywords: ['stage', 'idea', 'focus', 'priority', 'milestone', 'next step', 'early', 'starting'],
    guidance: 'Match the next move to the venture stage. At idea stage, test the problem and buyer before building; at MVP stage, test one core outcome; in beta, test repeated use and delivery; during growth, test whether acquisition and economics can repeat. Define one milestone and a clear signal that would change the next decision.'
  },
  {
    id: 'customer-discovery', title: 'Discover real customer problems', advisors: ['edith', 'friday', 'ultron'],
    stages: ['idea', 'validation', 'mvp'],
    keywords: ['customer', 'interview', 'problem', 'need', 'pain', 'demand', 'validation', 'user', 'jobs to be done'],
    guidance: 'In customer discovery, ask about a recent real situation: what the person tried, what it cost in time or money, and how they solved it. Avoid leading questions such as “would you use this?” Look for repeated behavior, urgency, an identifiable buyer, and a costly workaround. Treat compliments and stated intent as weaker evidence than a pilot, repeated use, referral, or payment.'
  },
  {
    id: 'experiments-and-mvp', title: 'Run small, informative experiments', advisors: ['friday', 'edith', 'ultron'],
    stages: ['idea', 'validation', 'mvp', 'prototype', 'beta'],
    keywords: ['mvp', 'prototype', 'experiment', 'build', 'feature', 'product', 'test', 'scope', 'ship'],
    guidance: 'Use a build–measure–learn loop. State the riskiest assumption, make the smallest safe test of it, choose a measurable signal in advance, and set a decision rule for continue, change, or stop. An MVP is the smallest way to learn whether a valuable outcome can be delivered; it is not a miniature version of every planned feature.'
  },
  {
    id: 'market-and-positioning', title: 'Define the market and alternatives', advisors: ['edith', 'ultron'],
    stages: ['idea', 'validation', 'mvp', 'beta', 'growth'],
    keywords: ['market', 'tam', 'competition', 'competitor', 'alternative', 'positioning', 'segment', 'moat', 'different'],
    guidance: 'Start with a specific customer segment and the alternatives they use now, including doing nothing or manual work. Explain why this group would switch and how you can reach them. Build market sizing from reachable customer groups and plausible spend; label assumptions. A defensible edge may come from distribution, workflow fit, data rights, trust, cost, or accumulated execution—not just a feature list.'
  },
  {
    id: 'go-to-market', title: 'Find a repeatable path to customers', advisors: ['edith', 'friday', 'ultron'],
    stages: ['mvp', 'beta', 'traction', 'growth'],
    keywords: ['go to market', 'marketing', 'sales', 'distribution', 'acquisition', 'channel', 'launch', 'customer growth', 'pipeline'],
    guidance: 'Choose one reachable customer group and test one acquisition channel before spreading effort across many. Track the path from first contact to purchase and continued use. In early B2B sales, learn who uses, who approves, who pays, and what blocks procurement. Expand a channel only when the team can explain why it worked and repeat it at a sensible cost.'
  },
  {
    id: 'business-model', title: 'Test pricing and value capture', advisors: ['edith', 'friday', 'ultron'],
    stages: ['validation', 'mvp', 'beta', 'growth'],
    keywords: ['price', 'pricing', 'revenue', 'business model', 'subscription', 'monetization', 'willingness to pay', 'paid'],
    guidance: 'Connect pricing to the buyer, value delivered, frequency of use, and available alternatives. Test a real price with a clear offer rather than relying only on survey intent. Track revenue quality, gross margin, delivery cost, refunds, and renewal or repeat purchase. Keep the model simple until customers reveal where value is created.'
  },
  {
    id: 'cash-and-runway', title: 'Protect cash and understand runway', advisors: ['jarvis', 'edith', 'ultron'],
    stages: ['all'],
    keywords: ['cash', 'runway', 'burn', 'budget', 'cost', 'expense', 'financial', 'money', 'survival'],
    guidance: 'Make a simple cash view: current cash, expected monthly inflows and outflows, committed costs, and a conservative runway estimate. Separate essential costs from reversible experiments. Revisit the forecast when hiring, fundraising, or large purchases are considered. Do not treat projected revenue or funding as cash until it is received; use an accountant for tax or accounting decisions.'
  },
  {
    id: 'funding-and-dilution', title: 'Choose funding that fits the venture', advisors: ['edith', 'jarvis'],
    stages: ['all'],
    keywords: ['funding', 'fundraise', 'investor', 'venture capital', 'angel', 'grant', 'loan', 'bootstrapping', 'dilution', 'equity'],
    guidance: 'Compare customer revenue, savings, grants, incubators, loans, angels, and venture capital by fit, timing, control, repayment, and dilution. Raise external capital for a defined milestone when the opportunity and growth model support it; do not assume every company should pursue VC. Before signing financing documents, understand ownership, control, fees, repayment obligations, and local legal and tax implications with qualified professionals.'
  },
  {
    id: 'metrics-and-learning', title: 'Measure outcomes, not activity alone', advisors: ['edith', 'friday', 'ultron'],
    stages: ['mvp', 'beta', 'traction', 'growth'],
    keywords: ['metric', 'kpi', 'retention', 'conversion', 'traction', 'growth', 'analytics', 'success', 'measure'],
    guidance: 'Pick a small set of measures tied to customer value and the current risk: activation, repeat use or retention, conversion, time to value, revenue, gross margin, or service reliability. Define the population and time window. Pair leading signals with outcomes, and do not treat downloads, signups, or press as traction without evidence of use or willingness to pay.'
  },
  {
    id: 'team-and-cofounders', title: 'Build a healthy founding team', advisors: ['jarvis', 'dume', 'ultron'],
    stages: ['all'],
    keywords: ['team', 'cofounder', 'co-founder', 'hire', 'hiring', 'employee', 'equity split', 'conflict', 'roles'],
    guidance: 'Clarify responsibilities, decision rights, expected time commitment, and how disagreements will be resolved before they become urgent. Discuss founder goals, finances, risk tolerance, and what happens if someone leaves. Avoid hiring ahead of a validated need. Use written agreements and qualified local advice for employment, equity, and intellectual property.'
  },
  {
    id: 'legal-ip-and-risk', title: 'Handle legal, IP, and operating risks', advisors: ['jarvis', 'ultron'],
    stages: ['all'],
    keywords: ['legal', 'compliance', 'regulation', 'privacy', 'security', 'intellectual property', 'ip', 'contract', 'license', 'liability'],
    guidance: 'Identify which rules actually apply based on location, customer, data, and product claims. Keep track of ownership and licenses for code, data, designs, and work created by contractors. Use the least sensitive data needed, control access, and document key vendor and customer terms. Treat this as a risk checklist, not legal advice; confirm important obligations with a qualified professional in the relevant jurisdiction.'
  },
  {
    id: 'ai-products', title: 'Build AI products around measured outcomes', advisors: ['friday', 'edith', 'ultron', 'jarvis'],
    stages: ['idea', 'mvp', 'beta', 'growth'],
    keywords: ['ai', 'artificial intelligence', 'llm', 'model', 'agent', 'machine learning', 'automation', 'accuracy', 'evaluation', 'inference'],
    guidance: 'For an AI product, define the user task and baseline before optimizing model scores. Create a representative evaluation set, measure quality on important cases, and track latency, inference cost, privacy, failure handling, and human review. Test unusual and harmful inputs. Keep a fallback path for uncertain outputs, and verify that AI improves the customer outcome enough to justify its cost and risk.'
  },
  {
    id: 'hardware-and-deeptech', title: 'Reduce technical and supply risks early', advisors: ['friday', 'edith', 'ultron', 'jarvis'],
    stages: ['idea', 'prototype', 'mvp', 'beta'],
    keywords: ['hardware', 'deep tech', 'deeptech', 'robot', 'device', 'manufacturing', 'supply chain', 'prototype', 'clinical', 'energy'],
    guidance: 'For hardware or deep technology, separate technical feasibility, customer demand, certification, manufacturing, and funding risks. Prototype the hardest technical assumption with the lowest-cost test; check component availability, lead times, unit cost, and service requirements before promising scale. Map regulatory or safety gates early and get specialist review where the consequences of error are high.'
  },
  {
    id: 'founder-sustainability', title: 'Make progress sustainable for the founder', advisors: ['dume', 'jarvis'],
    stages: ['all'],
    keywords: ['energy', 'stress', 'burnout', 'overwhelmed', 'time', 'student', 'job', 'work life', 'motivation', 'wellbeing'],
    guidance: 'Plan around the founder’s real schedule, responsibilities, support, and energy. Turn a large goal into one achievable next action, protect time to recover, and revisit the plan when circumstances change. Treat low energy as useful planning information, not a character flaw. Encourage support from trusted people or qualified health professionals when distress is persistent or serious.'
  },
  {
    id: 'strategy-and-decisions', title: 'Make decisions with explicit assumptions', advisors: ['edith', 'jarvis', 'ultron'],
    stages: ['all'],
    keywords: ['strategy', 'decision', 'risk', 'uncertainty', 'pivot', 'quit', 'continue', 'plan', 'assumption', 'tradeoff'],
    guidance: 'For a consequential choice, state the decision, the main options, the evidence, and the assumptions. Prefer reversible tests when uncertainty is high; set a review date and a signal that would change the decision. Make tradeoffs explicit. Do not present a forecast as a fact or recommend a major irreversible step from thin evidence.'
  }
];

const STOP_WORDS = new Set(['about', 'after', 'again', 'also', 'been', 'being', 'between', 'could', 'from', 'have', 'into', 'just', 'more', 'most', 'much', 'need', 'only', 'other', 'should', 'some', 'than', 'that', 'their', 'them', 'there', 'these', 'they', 'this', 'those', 'through', 'very', 'want', 'what', 'when', 'where', 'which', 'while', 'with', 'would', 'your', 'founder', 'venture', 'startup', 'advice']);

function tokens(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g)?.filter(token => token.length > 2 && !STOP_WORDS.has(token)) || [];
}

export function retrieveVentureGuidance({
  question,
  ventureContext,
  advisorId,
  stage,
  limit = 3
}: {
  question: string;
  ventureContext: string;
  advisorId: VentureAdvisorId;
  stage?: string;
  limit?: number;
}): string {
  const query = `${question}\n${ventureContext}`.toLowerCase();
  const queryTokens = new Set(tokens(query));
  const normalizedStage = (stage || '').toLowerCase();
  const ranked = VENTURE_PLAYBOOK.map(entry => {
    const keywordScore = entry.keywords.reduce((score, keyword) => {
      const phrase = keyword.toLowerCase();
      if (phrase.includes(' ') || phrase.includes('-')) return score + (query.includes(phrase) ? 4 : 0);
      return score + (queryTokens.has(phrase) ? 2 : 0);
    }, 0);
    const roleScore = entry.advisors.includes(advisorId) ? 3 : 0;
    const stageScore = entry.stages.includes('all') || entry.stages.some(value => normalizedStage.includes(value)) ? 1 : 0;
    return { entry, score: keywordScore + roleScore + stageScore };
  }).sort((a, b) => b.score - a.score);

  return ranked.slice(0, limit).map(({ entry }) => `${entry.title}: ${entry.guidance}`).join('\n');
}
