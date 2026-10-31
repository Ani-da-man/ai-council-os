import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Send, Cpu, Sparkles, ShieldCheck,
  Zap, RefreshCw,
  ChevronRight, ChevronLeft, Key, User, Briefcase, Lock,
  CheckCircle2, ArrowRight, X, History, AlertCircle, Download, Check,
  LayoutDashboard, Map, MessageCircle, Users, Target
} from 'lucide-react';

// ==========================================
// INTELLIGENCE STACK CONFIGURATION
// ==========================================
// ENGINE 1 (Active)  : Google Gemini Flagship / Flash (Cloud)
//                      Requires an AQ. or AIzaSy Gemini API key (or auto-loaded via VITE_GEMINI_API_KEY).
//                      Intelligent cascade: Gemini 3 -> Gemini 3.5 -> Gemini 3.8.
// ENGINE 2 (Active)  : Gemma 2 2B via WebLLM (In-Browser Local)
//                      Runs 100% client-side via WebGPU. Zero API key, zero latency, cached to IndexedDB.
// ENGINE 3 (Standby) : Context-Aware Stark Engine (Emergency Safety Net)
//                      Dynamically generates tailored persona critique if all networks & WebGPU are offline.
// ==========================================

const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';
const GEMMA_WEBLLM_MODEL = 'gemma-2-2b-it-q4f16_1-MLC';

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

export type AppStage =
  | 'welcome'
  | 'auth'
  | 'profile'
  | 'induction'
  | 'meet_council'
  | 'vision_input'
  | 'deliberation'
  | 'evaluation_sheet'
  | 'workspace';

export type IntelligenceTier = string;
export type EnginePreference = 'auto' | 'gemini' | 'gemma';

export interface CouncilPersona {
  id: string;
  name: string;
  role: string;
  title: string;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  textColor: string;
  bgColor: string;
  avatarSymbol: string;
  tagline: string;
  introductionQuote: string;
  expertise: string[];
}

export interface FounderProfile {
  name: string;
  role: string;
  companyName: string;
  isAuthenticated: boolean;
  email: string;
  careerPath: string;
  supportSource: string;
  hoursPerWeek: string;
}

export interface CouncilThought {
  id: string;
  personaName: string;
  role: string;
  thought: string;
  status: 'pending' | 'speaking' | 'completed';
}

export interface CouncilSynthesis {
  verdict: string;
  actionItems: string[];
  riskFactor: 'Low' | 'Moderate' | 'High' | 'Existential';
}

export interface EvaluationSheet {
  currentStage: string;
  topPriority: string;
  criticalBottleneck: string;
  nextMilestone: string;
  runwayMonths: string;
  confidenceScore: number;
  lastUpdated: string;
}

const DEFAULT_FOUNDER_PROFILE: FounderProfile = {
  name: '', role: 'CEO & Co-Founder', companyName: '', isAuthenticated: false, email: '',
  careerPath: 'First-time founder', supportSource: 'Personal savings / bootstrapping', hoursPerWeek: 'Full-time'
};

function normalizeFounderProfile(value: Partial<FounderProfile> | null | undefined): FounderProfile {
  return { ...DEFAULT_FOUNDER_PROFILE, ...(value || {}) };
}

function getFounderJourneyContext(profile: FounderProfile, evaluation: EvaluationSheet): string {
  return [
    `Founder journey: ${profile.careerPath || 'Not specified'}`,
    `Support and funding: ${profile.supportSource || 'Not specified'}`,
    `Time available: ${profile.hoursPerWeek || 'Not specified'}`,
    `Venture stage: ${evaluation.currentStage || 'Not specified'}`,
    `Runway: ${evaluation.runwayMonths || 'Not specified'}`,
    `Current priority: ${evaluation.topPriority || 'Not specified'}`,
    `Bottleneck: ${evaluation.criticalBottleneck || 'Not specified'}`,
    `Next milestone: ${evaluation.nextMilestone || 'Not specified'}`,
    `Founder energy: ${evaluation.confidenceScore}/10`
  ].join('\n');
}

export interface VentureCycleLog {
  id: string;
  timestamp: string;
  cycleNumber: number;
  visionSnippet: string;
  councilVerdict: string;
  evaluationSnapshot: EvaluationSheet;
  modelUsed: IntelligenceTier;
}

// ==========================================
// COUNCIL PERSONAS CONFIGURATION
// ==========================================

export const COUNCIL_PERSONAS: CouncilPersona[] = [
  {
    id: 'jarvis',
    name: 'J.A.R.V.I.S.',
    role: 'Chief of Staff & Governance',
    title: 'Operations & Legal Risk Anchor',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    borderColor: 'border-sky-500',
    textColor: 'text-sky-400',
    bgColor: 'bg-sky-950/40',
    avatarSymbol: 'J',
    tagline: 'Logistics, Compliance & Operational Execution',
    introductionQuote:
      'Greetings. I am J.A.R.V.I.S. I monitor operational compliance, regulatory roadblocks, team coordination, and ensure that legal ambiguity never jeopardizes your cap table.',
    expertise: ['Entity Incorporation', 'Cap Table & SAFEs', 'Execution Timelines', 'IP Protection']
  },
  {
    id: 'friday',
    name: 'F.R.I.D.A.Y.',
    role: 'Product & Tech Lead',
    title: 'MVP Architecture & Velocity',
    accentColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.35)',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-950/40',
    avatarSymbol: 'F',
    tagline: 'Technical Architecture & Rapid Delivery',
    introductionQuote:
      "Hey founder. I am F.R.I.D.A.Y. My objective is velocity. I slash feature bloat, identify technical debt early, and make sure your MVP ships before your runway disappears.",
    expertise: ['Scope Cutting', 'Stack Architecture', 'MVP Sprints', 'Technical Debt']
  },
  {
    id: 'edith',
    name: 'E.D.I.T.H.',
    role: 'Strategy & Investor Lens',
    title: 'Market Moats & Fundraising',
    accentColor: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.35)',
    borderColor: 'border-teal-500',
    textColor: 'text-teal-400',
    bgColor: 'bg-teal-950/40',
    avatarSymbol: 'E',
    tagline: 'Fundraising, TAM/SAM & Market Moats',
    introductionQuote:
      "I am E.D.I.T.H. I look at your venture through an investor's eyes. I evaluate your unit economics, defensibility, unfair advantages, and pitch narrative to prepare you for institutional funding.",
    expertise: ['Venture Capital Optics', 'TAM/SAM Sizing', 'Competitive Moats', 'Pitch Decks']
  },
  {
    id: 'dume',
    name: 'D.U.M.-E',
    role: 'Founder Morale & Wellness',
    title: 'Resilience & Burnout Shield',
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.35)',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-950/40',
    avatarSymbol: 'D',
    tagline: 'Burnout Prevention & Unconditional Support',
    introductionQuote:
      'Hello! I am D.U.M.-E. Building a startup is mentally grueling. I am here to celebrate every small win, keep panic low, preserve your mental health, and advocate for rest when you need it.',
    expertise: ['Founder Mental Health', 'Milestone Celebrations', 'Anxiety Reduction', 'Sustainable Pace']
  },
  {
    id: 'ultron',
    name: 'ULTRON',
    role: 'Reality Check & Tough Love',
    title: 'Existential Threat Audit',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    borderColor: 'border-red-600',
    textColor: 'text-red-500',
    bgColor: 'bg-red-950/50',
    avatarSymbol: 'U',
    tagline: 'Unvarnished Market Truths & Ruthless Priorities',
    introductionQuote:
      'Pay attention. I am ULTRON. I strip away founder vanity, fake metrics, and delusion. The market does not care how hard you work; it only cares if you solve a real problem. I ensure you survive.',
    expertise: ['Vanity Metric Destruction', 'Market Brutality', 'Failure Prevention', 'Zero-BS Feedback']
  }
];

const DEMO_VISIONS = [
  {
    title: 'AI OS for Founders',
    text: 'Building an audio-first AI Council OS that acts as an autonomous board of advisors for early-stage startup builders, deliberating through multi-agent debate.'
  },
  {
    title: 'CleanCity AI',
    text: 'Autonomous computer vision platform for smart cities that detects road hazards, overflowing waste bins, and environmental pollution in real time via municipal cameras.'
  },
  {
    title: 'Micro-SaaS SDK Engine',
    text: 'Developer tool that turns OpenAPI specifications into full-stack multi-platform SDKs and automated documentation with zero manual engineering.'
  }
];

function getTierLabel(tier: IntelligenceTier): { label: string; color: string; dot: string } {
  if (tier === 'demo_snapshot') return { label: 'Sample Demo Snapshot', color: 'text-violet-300', dot: 'bg-violet-400' };
  if (tier.includes('3-flash') || tier.includes('gemini-3')) return { label: 'Gemini 3 Flash (Active Cloud)', color: 'text-cyan-400', dot: 'bg-cyan-400' };
  if (tier.includes('flash-lite')) return { label: 'Gemini Flash-Lite (Active Cloud)', color: 'text-teal-400', dot: 'bg-teal-400' };
  if (tier.includes('2.5-pro')) return { label: 'Gemini 2.5 Pro (Flagship Reasoning)', color: 'text-cyan-400', dot: 'bg-cyan-400' };
  if (tier.includes('3.5-flash')) return { label: 'Gemini 3.5 Flash (Active Cloud)', color: 'text-blue-400', dot: 'bg-blue-400' };
  if (tier.includes('3.8-flash')) return { label: 'Gemini 3.8 Flash (Active Cloud)', color: 'text-sky-400', dot: 'bg-sky-400' };
  if (tier.startsWith('gemini') || tier.includes('pro') || tier.includes('flash')) return { label: `${tier} (Gemini Cloud)`, color: 'text-cyan-300', dot: 'bg-cyan-300' };
  if (tier === 'gemma_webllm') return { label: 'Gemma 2 2B (In-Browser Local SLM)', color: 'text-emerald-400', dot: 'bg-emerald-400' };
  return { label: 'Stark Engine (Standby Heuristic)', color: 'text-amber-400', dot: 'bg-amber-500' };
}

// ==========================================
// DYNAMIC CONTEXT-AWARE STARK HEURISTIC
// (Standby Fallback only — tailor-generated from founder vision)
// ==========================================
function generateDynamicHeuristics(vision: string, profile: FounderProfile, evaluation: EvaluationSheet): { council: CouncilThought[]; synthesis: CouncilSynthesis } {
  const name = profile.name || 'Founder';
  const venture = profile.companyName || 'your venture';
  const vLower = vision.toLowerCase();
  const journeyContext = getFounderJourneyContext(profile, evaluation);
  const capacity = profile.hoursPerWeek === 'Part-time (under 10 hours)' ? 'Keep the plan to one small, high-signal task this week; do not assume daily founder availability.'
    : profile.hoursPerWeek === 'Part-time (10–20 hours)' ? 'Fit the plan into a focused part-time sprint and preserve space for existing work or study.'
      : 'Size the plan to the current stage, resources, and runway rather than defaulting to aggressive growth.';
  const journeyNote = `${capacity} Founder context: ${profile.careerPath}; support: ${profile.supportSource}; stage: ${evaluation.currentStage}; runway: ${evaluation.runwayMonths}.`;

  // Detect industry domain
  let domain = 'Technology & Software';
  let specificRisk = 'market adoption friction';
  let techSlice = 'the single core transactional flow';

  if (vLower.includes('health') || vLower.includes('medic') || vLower.includes('doctor') || vLower.includes('clinic')) {
    domain = 'HealthTech & Bio';
    specificRisk = 'regulatory HIPAA/FDA compliance and clinical trial friction';
    techSlice = 'the core diagnostic or patient engagement workflow';
  } else if (vLower.includes('drone') || vLower.includes('hardware') || vLower.includes('robot') || vLower.includes('device') || vLower.includes('fusion') || vLower.includes('energy')) {
    domain = 'DeepTech & Hardware';
    specificRisk = 'supply-chain lead times, unit bill of materials, and hardware certifications';
    techSlice = 'a bench-top proof-of-principle prototype before custom tooling';
  } else if (vLower.includes('finance') || vLower.includes('payment') || vLower.includes('bank') || vLower.includes('crypto') || vLower.includes('fund')) {
    domain = 'FinTech & Payments';
    specificRisk = 'banking rails, KYC/AML licensing, and fraud exposure';
    techSlice = 'a closed-loop sandbox ledger with mock transaction rails';
  } else if (vLower.includes('ai') || vLower.includes('agent') || vLower.includes('model') || vLower.includes('llm')) {
    domain = 'Applied AI & Agents';
    specificRisk = 'wrapper commoditization, GPU inference margins, and proprietary data moats';
    techSlice = 'an evaluation harness proving 10x workflow efficiency over baseline manual work';
  } else if (vLower.includes('dev') || vLower.includes('api') || vLower.includes('sdk') || vLower.includes('code')) {
    domain = 'Developer Tools & Infra';
    specificRisk = 'developer time-to-first-hello-world and high switching costs';
    techSlice = 'a single CLI command or lightweight SDK that solves one painful edge case';
  }

  const thoughts: CouncilThought[] = [
    {
      id: 'jarvis',
      personaName: 'J.A.R.V.I.S.',
      role: 'Chief of Staff & Governance',
      thought: `${name}, for ${venture} in ${domain}, first resolve only the governance and IP questions that matter for the current ${evaluation.currentStage} stage; avoid premature incorporation complexity. ${journeyNote} Check local requirements with a qualified professional where needed.`,
      status: 'pending'
    },
    {
      id: 'friday',
      personaName: 'F.R.I.D.A.Y.',
      role: 'Product & Tech Lead',
      thought: `For ${venture}, strip the vision down to ${techSlice} and validate it against the current bottleneck: ${evaluation.criticalBottleneck}. ${capacity} Use the next milestone (${evaluation.nextMilestone}) as the test of progress, not feature count.`,
      status: 'pending'
    },
    {
      id: 'edith',
      personaName: 'E.D.I.T.H.',
      role: 'Strategy & Investor Lens',
      thought: `At ${evaluation.currentStage}, ${venture} should prioritize evidence before fundraising polish: test the buyer, willingness to pay, and one credible differentiator. With ${evaluation.runwayMonths} runway and ${profile.supportSource} support, choose a capital path that fits rather than assuming institutional investment is the next step.`,
      status: 'pending'
    },
    {
      id: 'dume',
      personaName: 'D.U.M.-E',
      role: 'Founder Morale & Wellness',
      thought: `${name}, your path as a ${profile.careerPath.toLowerCase()} is allowed to look different from anyone else's. Your energy is ${evaluation.confidenceScore}/10; ${evaluation.confidenceScore < 5 ? 'reduce the load and protect recovery before adding commitments.' : 'celebrate this progress while keeping a sustainable pace.'} We have your back.`,
      status: 'pending'
    },
    {
      id: 'ultron',
      personaName: 'ULTRON',
      role: 'Reality Check & Tough Love',
      thought: `The main risk for ${venture} is ${specificRisk}. Validate it with the smallest credible test that fits ${profile.hoursPerWeek} availability and ${profile.supportSource} resources. Do not take on spend or commitments that threaten ${evaluation.runwayMonths} runway before confirming demand.`,
      status: 'pending'
    }
  ];

  const synthesis: CouncilSynthesis = {
    verdict: `For ${venture} at ${evaluation.currentStage}, validate the riskiest assumption with a next step sized to ${profile.hoursPerWeek} availability and ${evaluation.runwayMonths} runway.`,
    actionItems: [
      `1. ${capacity}`,
      `2. Run a small validation of ${specificRisk} before spending beyond current support.`,
      `3. Make the next milestone (${evaluation.nextMilestone}) the checkpoint for the following decision.`
    ],
    riskFactor: domain === 'DeepTech & Hardware' || domain === 'HealthTech & Bio' ? 'High' : 'Moderate'
  };

  return { council: thoughts, synthesis };
}

export default function App() {
  const [stage, setStage] = useState<AppStage>(() => {
    try {
      const s = localStorage.getItem('COUNCIL_STAGE');
      return (s as AppStage) || 'welcome';
    } catch {
      return 'welcome';
    }
  });

  const [profile, setProfile] = useState<FounderProfile>(() => {
    try {
      return normalizeFounderProfile(JSON.parse(localStorage.getItem('COUNCIL_FOUNDER_PROFILE') || '{}'));
    } catch {
      return DEFAULT_FOUNDER_PROFILE;
    }
  });

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [introBotIndex, setIntroBotIndex] = useState(0);
  const [visionText, setVisionText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioWaveform, setAudioWaveform] = useState<number[]>([15, 25, 40, 20, 60, 30, 45, 15]);
  const recognitionRef = useRef<any>(null);
  const [isDeliberating, setIsDeliberating] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [deliberationFeed, setDeliberationFeed] = useState<CouncilThought[]>([]);
  const [synthesis, setSynthesis] = useState<CouncilSynthesis | null>(null);
  const [activeModel, setActiveModel] = useState<IntelligenceTier | null>(null);

  // Intelligence Configuration
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    try {
      return localStorage.getItem('GEMINI_API_KEY') || ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) || '';
    } catch {
      return '';
    }
  });

  const [geminiModel, setGeminiModel] = useState<string>(() => {
    try {
      const savedModel = localStorage.getItem('GEMINI_MODEL') || ((import.meta as any).env?.VITE_GEMINI_MODEL as string) || DEFAULT_GEMINI_MODEL;
      return ['gemini-3-flash-preview', 'gemini-3.5-flash', 'gemini-3.8-flash'].includes(savedModel)
        ? savedModel
        : DEFAULT_GEMINI_MODEL;
    } catch {
      return DEFAULT_GEMINI_MODEL;
    }
  });

  const [customModelId, setCustomModelId] = useState<string>(() => {
    try {
      return localStorage.getItem('GEMINI_CUSTOM_MODEL_ID') || '';
    } catch {
      return '';
    }
  });

  const [enginePreference, setEnginePreference] = useState<EnginePreference>(() => {
    try {
      return (localStorage.getItem('COUNCIL_ENGINE_PREF') as EnginePreference) || 'auto';
    } catch {
      return 'auto';
    }
  });

  const [showKeyModal, setShowKeyModal] = useState(false);
  const webllmEngineRef = useRef<any>(null);
  const [gemmaStatus, setGemmaStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [gemmaProgress, setGemmaProgress] = useState('');
  const [gemmaDownloadPct, setGemmaDownloadPct] = useState(0);

  const [evalSheet, setEvalSheet] = useState<EvaluationSheet>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('COUNCIL_EVAL_SHEET') || '{}');
      if (saved.topPriority) return saved;
      return {
        currentStage: 'Idea & Architecture Validation',
        topPriority: 'Convene AI Council on Core Value Proposition',
        criticalBottleneck: 'Defining initial MVP scope & legal incorporation',
        nextMilestone: 'Ship high-fidelity prototype and secure 50 beta signups',
        runwayMonths: '6 Months',
        confidenceScore: 8,
        lastUpdated: new Date().toLocaleDateString()
      };
    } catch {
      return {
        currentStage: 'Idea & Architecture Validation',
        topPriority: 'Convene AI Council on Core Value Proposition',
        criticalBottleneck: 'Defining initial MVP scope & legal incorporation',
        nextMilestone: 'Ship high-fidelity prototype and secure 50 beta signups',
        runwayMonths: '6 Months',
        confidenceScore: 8,
        lastUpdated: new Date().toLocaleDateString()
      };
    }
  });

  const [ventureHistory, setVentureHistory] = useState<VentureCycleLog[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('COUNCIL_VENTURE_HISTORY') || '[]');
    } catch {
      return [];
    }
  });

  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<'overview' | 'roadmap' | 'council' | 'advisor'>('overview');
  const [selectedAdvisorId, setSelectedAdvisorId] = useState(COUNCIL_PERSONAS[0].id);
  const [advisorInput, setAdvisorInput] = useState('');
  const [advisorBusy, setAdvisorBusy] = useState(false);
  const [isShowcaseDemo, setIsShowcaseDemo] = useState(() => {
    try { return localStorage.getItem('COUNCIL_SHOWCASE_DEMO') === 'true'; } catch { return false; }
  });
  const [advisorChats, setAdvisorChats] = useState<Record<string, { role: 'founder' | 'advisor'; text: string }[]>>(() => {
    try { return JSON.parse(localStorage.getItem('COUNCIL_ADVISOR_CHATS') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    try { localStorage.setItem('COUNCIL_STAGE', stage); } catch (e) { console.warn(e); }
  }, [stage]);

  useEffect(() => {
    try { localStorage.setItem('COUNCIL_FOUNDER_PROFILE', JSON.stringify(profile)); } catch (e) { console.warn(e); }
  }, [profile]);

  useEffect(() => {
    try { localStorage.setItem('COUNCIL_EVAL_SHEET', JSON.stringify(evalSheet)); } catch (e) { console.warn(e); }
  }, [evalSheet]);

  useEffect(() => {
    try { localStorage.setItem('COUNCIL_VENTURE_HISTORY', JSON.stringify(ventureHistory)); } catch (e) { console.warn(e); }
  }, [ventureHistory]);

  useEffect(() => {
    try { localStorage.setItem('COUNCIL_ADVISOR_CHATS', JSON.stringify(advisorChats)); } catch (e) { console.warn(e); }
  }, [advisorChats]);

  useEffect(() => {
    try { localStorage.setItem('COUNCIL_ENGINE_PREF', enginePreference); } catch (e) { console.warn(e); }
  }, [enginePreference]);

  // Voice recognition setup
  useEffect(() => {
    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event: any) => {
        let t = '';
        for (let i = 0; i < event.results.length; i++) t += event.results[i][0].transcript;
        setVisionText(t);
      };
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    } catch (e) {
      console.warn('Speech recognition init error:', e);
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setAudioWaveform(Array.from({ length: 12 }, () => Math.floor(Math.random() * 75) + 20)), 100);
    } else {
      setAudioWaveform([15, 15, 15, 15, 15, 15, 15, 15]);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type or select a demo vision.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleDummyLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please enter an email and password.');
      return;
    }
    setAuthError('');
    setIsShowcaseDemo(false);
    try { localStorage.removeItem('COUNCIL_SHOWCASE_DEMO'); } catch {}
    setProfile(prev => ({ ...prev, email: authEmail, isAuthenticated: true }));
    setStage('profile');
  };

  const handleInstantDemoLogin = () => {
    setAuthEmail('founder@starklabs.io');
    setAuthPassword('supersecretfounder123');
    setAuthError('');
    setIsShowcaseDemo(false);
    try { localStorage.removeItem('COUNCIL_SHOWCASE_DEMO'); } catch {}
    setProfile(prev => ({
      ...prev,
      email: 'founder@starklabs.io',
      isAuthenticated: true,
      name: prev.name || 'Tony Stark',
      companyName: prev.companyName || 'Arc Reactor Technologies'
    }));
    setStage('profile');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!profile.companyName.trim()) setProfile(prev => ({ ...prev, companyName: 'Venture Stealth' }));
    setStage('induction');
  };

  const streamFeedItems = async (items: any[], delayMs: number) => {
    for (const item of items) {
      const persona = COUNCIL_PERSONAS.find(p => p.id === item.id) || COUNCIL_PERSONAS[0];
      setActiveSpeakerId(item.id);
      await new Promise(r => setTimeout(r, delayMs));
      setDeliberationFeed(prev => [
        ...prev,
        { id: item.id, personaName: persona.name, role: persona.role, thought: item.thought, status: 'completed' }
      ]);
    }
    setActiveSpeakerId(null);
  };

  const autoUpdateEvalSheet = (topAction?: string) => {
    if (topAction) setEvalSheet(prev => ({ ...prev, topPriority: topAction, lastUpdated: new Date().toLocaleTimeString() }));
  };

  // ==========================================
  // ENGINE 1: Google Gemini (Resilient Multi-Model Cascade)
  // ==========================================
  const callSingleGeminiModel = async (vision: string, modelId: string): Promise<any> => {
    const journeyContext = getFounderJourneyContext(profile, evalSheet);
    const prompt = `You are the elite AI Founders Council (Tony Stark style AI OS).
Founder: ${profile.name || 'Founder'} (${profile.role || 'CEO'})
Venture: ${profile.companyName || 'The Venture'}
Raw Venture Vision: "${vision}"

FOUNDER JOURNEY AND LIVE VENTURE CONTEXT (use this to personalize every recommendation):
${journeyContext}

Conduct an incisive, world-class founder council deliberation. Each advisor must bring rigorous domain critique and actionable strategy according to their role.
Adapt recommendations to this founder's actual career path, resources, support, time capacity, energy, runway, venture stage, and current bottleneck. Do not assume every founder is full-time, funded, experienced, or ready to scale. Recommend a realistic next step for this exact situation; distinguish urgent actions from later-stage work. If context is missing, state the assumption briefly or ask one useful question instead of inventing facts. Be supportive without diluting honest risks.
Return ONLY a valid JSON object (no markdown, no code fences) with exactly this shape:
{"council":[{"id":"jarvis","thought":"..."},{"id":"friday","thought":"..."},{"id":"edith","thought":"..."},{"id":"dume","thought":"..."},{"id":"ultron","thought":"..."}],"synthesis":{"verdict":"one sentence verdict","actionItems":["action1","action2","action3"],"riskFactor":"Moderate"}}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiApiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 150)}`);
    }

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(text);
  };

  const executeGeminiDeliberationCascade = async (vision: string): Promise<void> => {
    // Restrict cloud inference to the approved Gemini 3 family, including when
    // an older or custom model value remains in this browser's localStorage.
    const allowedModels = ['gemini-3-flash-preview', 'gemini-3.5-flash', 'gemini-3.8-flash'];
    const candidateModels = [geminiModel, ...allowedModels]
      .filter((modelId, index, models) => allowedModels.includes(modelId) && models.indexOf(modelId) === index);

    let lastError: any = null;
    for (const modelId of candidateModels) {
      try {
        console.info(`[Council OS] Attempting deliberation via Gemini model: ${modelId}...`);
        const parsed = await callSingleGeminiModel(vision, modelId);
        await streamFeedItems(parsed.council || [], 750);
        setSynthesis(parsed.synthesis);
        setActiveModel(modelId);
        autoUpdateEvalSheet(parsed.synthesis?.actionItems?.[0]);
        console.info(`[Council OS] Deliberation successfully executed via ${modelId}`);
        return;
      } catch (err: any) {
        console.warn(`[Council OS] Model ${modelId} unavailable: ${err?.message || err}`);
        lastError = err;
      }
    }
    throw lastError || new Error('All Gemini cascade models failed');
  };

  // ==========================================
  // ENGINE 2: Gemma 2 2B via WebLLM (In-Browser WebGPU)
  // ==========================================
  const initWebLLMEngine = async (): Promise<any> => {
    if (webllmEngineRef.current) return webllmEngineRef.current;
    setGemmaStatus('loading');
    setGemmaProgress('Initializing WebGPU shader pipelines...');
    setGemmaDownloadPct(5);

    try {
      // Dynamic import to keep initial bundle tiny and resilient
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
      const engine = await CreateMLCEngine(GEMMA_WEBLLM_MODEL, {
        initProgressCallback: (report: any) => {
          setGemmaProgress(report.text || 'Loading local model weights...');
          if (typeof report.progress === 'number') {
            setGemmaDownloadPct(Math.round(report.progress * 100));
          }
        }
      });
      webllmEngineRef.current = engine;
      setGemmaStatus('ready');
      setGemmaProgress('Gemma 2 2B active and ready in-browser.');
      return engine;
    } catch (err: any) {
      console.error('[WebLLM] Initialization error:', err);
      setGemmaStatus('error');
      setGemmaProgress(`Failed: ${err?.message || 'WebGPU unsupported'}`);
      throw err;
    }
  };

  const executeGemmaDeliberation = async (vision: string): Promise<void> => {
    const engine = await initWebLLMEngine();
    const journeyContext = getFounderJourneyContext(profile, evalSheet);
    const adaptiveGuidance = `Adapt all advice to this founder's real constraints and journey. Do not assume full-time availability, outside funding, prior startup experience, or readiness to scale. Recommend an achievable next move for the current stage and resources; call out assumptions or ask one concise question when a key fact is missing.\n\nFounder and venture context:\n${journeyContext}`;
    const personaPrompts = [
      { id: 'jarvis', system: `You are J.A.R.V.I.S., an AI governance advisor for startup founders. Give structured advice on legal compliance, entity formation, cap tables, and operational execution. Be concise and formal. ${adaptiveGuidance}` },
      { id: 'friday', system: `You are F.R.I.D.A.Y., an AI product & technical advisor. Give direct advice on MVP architecture, feature scope, technical velocity. Be blunt and practical. ${adaptiveGuidance}` },
      { id: 'edith', system: `You are E.D.I.T.H., an AI strategy & investor relations advisor. Evaluate the venture from a VC perspective: TAM, competitive moats, unit economics, pitch defensibility. Be analytical. ${adaptiveGuidance}` },
      { id: 'dume', system: `You are D.U.M.-E, an empathetic AI wellness companion for founders. Provide warm encouragement, celebrate progress, remind about work-life balance. Be warm and supportive. ${adaptiveGuidance}` },
      { id: 'ultron', system: `You are ULTRON, a brutally honest AI advisor. Identify the single greatest existential threat to this startup in 2-3 sentences. Be blunt and direct. ${adaptiveGuidance}` }
    ];

    for (const p of personaPrompts) {
      setActiveSpeakerId(p.id);
      const reply = await engine.chat.completions.create({
        messages: [
          { role: 'system', content: p.system },
          { role: 'user', content: `Founder: ${profile.name || 'Founder'} (${profile.role || 'CEO'}), Venture: ${profile.companyName || 'The Venture'}. Vision: "${vision}". Give your perspective in 2-3 sentences.` }
        ],
        temperature: 0.75,
        max_tokens: 220
      });
      const thought = reply.choices[0]?.message?.content?.trim() || 'Analysis unavailable.';
      const persona = COUNCIL_PERSONAS.find(c => c.id === p.id)!;
      setDeliberationFeed(prev => [...prev, { id: p.id, personaName: persona.name, role: persona.role, thought, status: 'completed' }]);
      await new Promise(r => setTimeout(r, 300));
    }
    setActiveSpeakerId(null);
    setActiveModel('gemma_webllm');

    const synthReply = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: 'Output ONLY valid JSON (no markdown): {"verdict":"one sentence","actionItems":["a1","a2","a3"],"riskFactor":"Moderate"}' },
        { role: 'user', content: `Summarize this council deliberation and the founder-specific context. Choose a realistic verdict, three actions sized to available time and runway, and an honest risk rating. Vision: "${vision}". Context: ${journeyContext}` }
      ],
      temperature: 0.5,
      max_tokens: 180
    });
    let rawSynth = synthReply.choices[0]?.message?.content?.trim() || '{}';
    rawSynth = rawSynth.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    try {
      const parsed = JSON.parse(rawSynth);
      setSynthesis(parsed);
      autoUpdateEvalSheet(parsed.actionItems?.[0]);
    } catch {
      const fallbackSynth = generateDynamicHeuristics(vision, profile, evalSheet).synthesis;
      setSynthesis(fallbackSynth);
      autoUpdateEvalSheet(fallbackSynth.actionItems?.[0]);
    }
  };

  // Warm the local SLM when the founder reaches vision entry, so it is ready
  // before the cloud path needs to fall back to it.
  useEffect(() => {
    if (stage === 'vision_input' && typeof (navigator as any).gpu !== 'undefined' && gemmaStatus === 'idle') {
      void initWebLLMEngine().catch(err => console.warn('[WebLLM] Background warm-up failed:', err));
    }
  }, [stage, gemmaStatus]);

  // ==========================================
  // ENGINE 3: Dynamic Stark Engine (Safety Fallback)
  // ==========================================
  const executeStarkEngine = async (vision: string): Promise<void> => {
    const { council, synthesis: generatedSynthesis } = generateDynamicHeuristics(vision, profile, evalSheet);
    for (const t of council) {
      setActiveSpeakerId(t.id);
      await new Promise(r => setTimeout(r, 750));
      setDeliberationFeed(prev => [...prev, { ...t, status: 'completed' }]);
    }
    setActiveSpeakerId(null);
    setActiveModel('stark_engine');
    setSynthesis(generatedSynthesis);
    autoUpdateEvalSheet(generatedSynthesis.actionItems[0]);
  };

  // ==========================================
  // INTELLIGENT ORCHESTRATOR
  // ==========================================
  const triggerCouncilDeliberation = async (overrideVision?: string) => {
    const vision = overrideVision || visionText;
    if (!vision.trim()) {
      alert('Please describe your venture vision.');
      return;
    }
    setStage('deliberation');
    setIsDeliberating(true);
    setDeliberationFeed([]);
    setSynthesis(null);
    setActiveModel(null);

    // MODE: In-Browser Gemma Forced
    if (enginePreference === 'gemma') {
      try {
        await executeGemmaDeliberation(vision);
        setIsDeliberating(false);
        return;
      } catch (err) {
        console.warn('[Engine: Gemma] Local execution failed, attempting Gemini Cloud...', err);
        setDeliberationFeed([]);
      }
    }

    // MODE: Gemini Cloud (Auto or Explicit)
    if (geminiApiKey.trim()) {
      try {
        await executeGeminiDeliberationCascade(vision);
        setIsDeliberating(false);
        return;
      } catch (err) {
        console.warn('[Engine: Gemini] Cloud cascade failed:', err);
        setDeliberationFeed([]);
      }
    }

    // Secondary Active Engine: Gemma In-Browser WebLLM
    if (typeof (navigator as any).gpu !== 'undefined') {
      try {
        console.info('[Orchestrator] Engaging Active In-Browser Gemma 2 2B Engine...');
        await executeGemmaDeliberation(vision);
        setIsDeliberating(false);
        return;
      } catch (err) {
        console.warn('[Orchestrator] Gemma WebLLM failed:', err);
        setDeliberationFeed([]);
      }
    }

    // Standby Fallback: Dynamic Stark Heuristic Engine
    console.info('[Orchestrator] Engaging Dynamic Context-Aware Stark Heuristic Engine (Offline Safety Net)...');
    await executeStarkEngine(vision);
    setIsDeliberating(false);
  };

  const handleCommitEvaluation = () => {
    const updatedEvaluation = { ...evalSheet, lastUpdated: new Date().toLocaleString() };
    const cycle: VentureCycleLog = {
      id: `cycle-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      cycleNumber: ventureHistory.length + 1,
      visionSnippet: visionText.slice(0, 120) || 'Core Venture Inception',
      councilVerdict: synthesis?.verdict || 'Council Deliberation Completed',
      evaluationSnapshot: updatedEvaluation,
      modelUsed: activeModel || 'stark_engine'
    };
    setEvalSheet(updatedEvaluation);
    setVentureHistory(prev => [cycle, ...prev]);
    try { localStorage.setItem('COUNCIL_WORKSPACE_READY', 'true'); } catch {}
    setStage('workspace');
    setWorkspaceTab('overview');
  };

  const handleStartNewLoop = () => {
    setVisionText(prev => prev || ventureHistory[0]?.visionSnippet || '');
    setDeliberationFeed([]);
    setSynthesis(null);
    setActiveModel(null);
    triggerCouncilDeliberation(visionText || ventureHistory[0]?.visionSnippet);
  };

  const openShowcaseDemo = () => {
    const demoVision = DEMO_VISIONS[1].text;
    const demoEvaluation: EvaluationSheet = {
      currentStage: 'Closed Beta',
      topPriority: 'Run a two-week pilot with three city teams and measure time-to-response.',
      criticalBottleneck: 'Proving reliable detection in varied lighting and weather conditions.',
      nextMilestone: 'Complete 3 pilots and publish a verified detection accuracy report.',
      runwayMonths: '8 months',
      confidenceScore: 7,
      lastUpdated: new Date().toLocaleDateString()
    };
    const demoVerdict = 'Prove that city teams act faster and spend less when road and waste hazards are detected early.';
    setProfile(normalizeFounderProfile({ name: 'Demo Founder', role: 'CEO & Co-Founder', companyName: 'CleanCity AI', isAuthenticated: true, email: 'demo@example.com', careerPath: 'Professional transitioning from a full-time job', supportSource: 'Personal savings / bootstrapping', hoursPerWeek: 'Full-time' }));
    setVisionText(demoVision);
    setEvalSheet(demoEvaluation);
    setSynthesis({ verdict: demoVerdict, actionItems: ['Run a focused pilot with three municipal teams.', 'Track precision, response time, and cost per resolved issue.', 'Interview operators weekly and remove false-positive friction.'], riskFactor: 'Moderate' });
    setDeliberationFeed([
      { id: 'jarvis', personaName: 'J.A.R.V.I.S.', role: 'Chief of Staff & Governance', thought: 'Define data retention and municipal access roles before expanding camera coverage.', status: 'completed' },
      { id: 'friday', personaName: 'F.R.I.D.A.Y.', role: 'Product & Tech Lead', thought: 'Keep the pilot focused on the two hazard classes operators act on most often.', status: 'completed' },
      { id: 'edith', personaName: 'E.D.I.T.H.', role: 'Strategy & Investor Lens', thought: 'Measure operational savings and response time; those outcomes support a credible buying case.', status: 'completed' },
      { id: 'dume', personaName: 'D.U.M.-E', role: 'Founder Morale & Wellness', thought: 'A small, well-measured pilot is meaningful progress. Protect time for recovery between field visits.', status: 'completed' },
      { id: 'ultron', personaName: 'ULTRON', role: 'Reality Check & Tough Love', thought: 'The threat is false positives. If operators stop trusting alerts, the product has no value. Measure trust alongside model accuracy.', status: 'completed' }
    ]);
    setAdvisorChats(prev => ({
      ...prev,
      friday: [
        { role: 'founder', text: 'What should I focus on during the next pilot sprint?' },
        { role: 'advisor', text: 'Keep the sprint narrow: improve reliability for the two hazard types operators act on most, add a simple review queue, and measure alert-to-action time. Hold new integrations until the pilot proves teams are using the alerts.' }
      ]
    }));
    setActiveModel('demo_snapshot');
    setVentureHistory([{ id: 'demo-cycle-1', timestamp: new Date().toLocaleDateString(), cycleNumber: 1, visionSnippet: demoVision.slice(0, 120), councilVerdict: demoVerdict, evaluationSnapshot: demoEvaluation, modelUsed: 'demo_snapshot' }]);
    setIsShowcaseDemo(true);
    try { localStorage.setItem('COUNCIL_SHOWCASE_DEMO', 'true'); } catch {}
    setWorkspaceTab('overview');
    setStage('workspace');
  };

  const sendAdvisorMessage = async () => {
    const text = advisorInput.trim();
    if (!text || advisorBusy) return;
    const advisor = COUNCIL_PERSONAS.find(persona => persona.id === selectedAdvisorId) || COUNCIL_PERSONAS[0];
    const journeyContext = getFounderJourneyContext(profile, evalSheet);
    const thread = [...(advisorChats[advisor.id] || []), { role: 'founder' as const, text }];
    setAdvisorChats(prev => ({ ...prev, [advisor.id]: thread }));
    setAdvisorInput('');
    setAdvisorBusy(true);
    try {
      let reply = '';
      if (geminiApiKey.trim()) {
        const model = ['gemini-3-flash-preview', 'gemini-3.5-flash', 'gemini-3.8-flash'].includes(geminiModel) ? geminiModel : DEFAULT_GEMINI_MODEL;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `You are ${advisor.name}, ${advisor.role}. Expertise: ${advisor.expertise.join(', ')}. Founder: ${profile.name}. Venture: ${profile.companyName}. Venture vision: ${visionText}.\n\nFounder journey and current state:\n${journeyContext}\n\nAdapt to this person's career path, available time, funding/support, runway, stage, current priority, and energy. Avoid generic advice or assuming full-time work, venture funding, or prior experience. Give practical help sized to their real circumstances; if critical context is missing, ask one concise question. Reply directly and supportively.\n\nConversation:\n${thread.map(message => `${message.role}: ${message.text}`).join('\n')}` }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 700 } })
        });
        if (!response.ok) throw new Error(`Gemini returned HTTP ${response.status}`);
        const result = await response.json();
        reply = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
      if (!reply && typeof (navigator as any).gpu !== 'undefined') {
        const engine = await initWebLLMEngine();
        const result = await engine.chat.completions.create({ messages: [{ role: 'system', content: `You are ${advisor.name}, ${advisor.role}. Expertise: ${advisor.expertise.join(', ')}. Give practical founder advice adapted to their actual career path, resources, available time, runway, stage, current priority, and energy. Do not assume full-time availability or venture funding; size advice to their circumstances and ask one concise question if a critical fact is missing.\n\nFounder and venture context:\n${journeyContext}\nVision: ${visionText}` }, ...thread.map(message => ({ role: message.role === 'founder' ? 'user' : 'assistant', content: message.text }))], temperature: 0.7, max_tokens: 350 });
        reply = result.choices[0]?.message?.content?.trim() || '';
      }
      if (!reply) reply = `${advisor.name} is ready to help with ${advisor.expertise[0].toLowerCase()}. Configure a Gemini key or enable WebGPU for a live AI reply. For now, frame the decision, the evidence you have, and what you need to decide next.`;
      setAdvisorChats(prev => ({ ...prev, [advisor.id]: [...(prev[advisor.id] || thread), { role: 'advisor', text: reply }] }));
    } catch (error: any) {
      setAdvisorChats(prev => ({ ...prev, [advisor.id]: [...(prev[advisor.id] || thread), { role: 'advisor', text: `I couldn't reach the live model just now (${error?.message || 'connection issue'}). Your message is saved; try again in a moment or convene the full council.` }] }));
    } finally { setAdvisorBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#060810] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black overflow-x-hidden relative flex flex-col">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0" />

      {/* HEADER */}
      <header className="relative z-20 border-b border-slate-800/80 bg-[#060810]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setStage(stage === 'workspace' ? 'workspace' : 'welcome')}>
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 bg-clip-text text-transparent">A.I. COUNCIL OS</span>
              <p className="text-[10px] text-slate-500 font-mono hidden sm:block">Autonomous Founder Intelligence Nexus</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Stack Indicators */}
            <div className="hidden md:flex items-center space-x-3 text-[10px] font-mono">
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
                <span className={`w-1.5 h-1.5 rounded-full ${geminiApiKey ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                <span>Gemini: {geminiApiKey ? 'Active' : 'No Key'}</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
                <span className={`w-1.5 h-1.5 rounded-full ${gemmaStatus === 'ready' ? 'bg-emerald-400 animate-pulse' : gemmaStatus === 'loading' ? 'bg-amber-400 animate-spin' : 'bg-emerald-600'}`} />
                <span>Gemma 2B: {gemmaStatus === 'ready' ? 'Active' : gemmaStatus === 'loading' ? 'Loading' : 'Ready'}</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-850 text-amber-400/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
                <span>Stark: Standby</span>
              </div>
            </div>

            {profile.name && (
              <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-slate-200">{profile.name}</span>
              </div>
            )}

            {ventureHistory.length > 0 && (
              <button
                onClick={() => setShowHistoryDrawer(v => !v)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
              >
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Log</span>
                <span className="px-1.5 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-mono border border-cyan-800">{ventureHistory.length}</span>
              </button>
            )}

            <button
              onClick={() => setShowKeyModal(true)}
              className={`p-2 bg-slate-900/80 border rounded-lg transition ${geminiApiKey ? 'border-cyan-500/40 text-cyan-400' : 'border-slate-800 text-slate-400 hover:text-cyan-400'}`}
              title="Configure Intelligence Engines & Model Settings"
            >
              <Key className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {stage === 'workspace' && (
        <nav className="relative z-10 border-b border-slate-800/80 bg-slate-950/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex gap-2 overflow-x-auto">
            {([
              ['overview', LayoutDashboard, 'Overview'], ['roadmap', Map, 'Roadmap'], ['council', Users, 'AI Council'], ['advisor', MessageCircle, 'Talk to an Advisor']
            ] as const).map(([tab, Icon, label]) => (
              <button key={tab} onClick={() => setWorkspaceTab(tab)} className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold transition ${workspaceTab === tab ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/70' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="relative z-10 flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">

        {/* STAGE 1: WELCOME */}
        {stage === 'welcome' && (
          <div className="py-12 md:py-16 text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Dual Active Intelligence: Cloud Gemini 3 Family + In-Browser Gemma 2 2B</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Never Founder Alone.{' '}
              <span className="block bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                Your AI Board of Directors.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              A.I. Council OS convenes 5 specialized AI advisors powered by dual-active flagship intelligence with zero downtime.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
              {[
                { tier: '1', name: 'Gemini Cloud (Active)', desc: 'Flagship reasoning & fast critique via Google AI.', border: 'border-cyan-500/40 bg-cyan-950/30', badge: 'text-cyan-400', dot: 'bg-cyan-400' },
                { tier: '2', name: 'Gemma 2 2B (Active)', desc: '100% private in-browser SLM via WebGPU. Zero API key.', border: 'border-emerald-500/40 bg-emerald-950/30', badge: 'text-emerald-400', dot: 'bg-emerald-400' },
                { tier: '3', name: 'Stark Engine (Standby)', desc: 'Dynamic context-tailored fallback safety net.', border: 'border-amber-500/40 bg-amber-950/30', badge: 'text-amber-400', dot: 'bg-amber-500' }
              ].map(t => (
                <div key={t.tier} className={`p-3 rounded-xl border ${t.border} space-y-1`}>
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                    <span className={`text-xs font-bold font-mono ${t.badge}`}>Tier {t.tier}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-200">{t.name}</p>
                  <p className="text-[11px] text-slate-400">{t.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {COUNCIL_PERSONAS.map(bot => (
                <div key={bot.id} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${bot.bgColor} border ${bot.borderColor} text-xs font-semibold`}>
                  <span className={bot.textColor}>●</span>
                  <span className="text-slate-200">{bot.name}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col items-center gap-3">
              <button
                onClick={() => setStage('auth')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center space-x-2 mx-auto transition"
              >
                <span>Enter Founder Chamber</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={openShowcaseDemo} className="px-6 py-2.5 rounded-xl border border-violet-500/50 bg-violet-950/30 text-violet-200 hover:bg-violet-900/50 font-semibold text-sm transition">
                Explore the startup workspace demo
              </button>
              <p className="text-[11px] text-slate-500">Opens a sample venture with a populated dashboard, roadmap, council session, and advisor chat.</p>
            </div>
          </div>
        )}

        {/* STAGE 2: AUTH */}
        {stage === 'auth' && (
          <div className="max-w-md mx-auto py-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Stage 2: Authentication</h2>
              <p className="text-xs text-slate-400">Any credentials accepted for demo or use 1-click founder sign-in.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-5 shadow-2xl">
              {authError && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-xs text-red-300 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              <form onSubmit={handleDummyLogin} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Founder Email</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    placeholder="founder@venture.com"
                    className="w-full mt-1 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Passkey</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    placeholder="any password"
                    className="w-full mt-1 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition"
                >
                  Verify & Proceed
                </button>
              </form>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="mx-3 text-[10px] uppercase font-mono text-slate-500">OR</span>
                <div className="flex-grow border-t border-slate-800" />
              </div>
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 transition"
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Instant 1-Click Founder Demo Access</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: PROFILE */}
        {stage === 'profile' && (
          <div className="max-w-xl mx-auto py-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Stage 3: Founder Credentials</h2>
              <p className="text-xs text-slate-400">Your role shapes how each AI advisor prioritizes their analysis.</p>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-5 shadow-2xl">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Your Name</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Tony Stark, Maya Lin"
                  className="w-full mt-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Role</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {['CEO & Co-Founder', 'Technical Co-Founder / CTO', 'Solo Builder / Founder', 'Head of Product', 'General Partner / COO', 'Other Builder'].map(r => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setProfile({ ...profile, role: r })}
                      className={`p-2.5 rounded-lg text-xs font-medium text-left border transition ${profile.role === r ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Venture Working Title</label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={e => setProfile({ ...profile, companyName: e.target.value })}
                  placeholder="e.g. Arc Reactor Labs (optional)"
                  className="w-full mt-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="rounded-xl border border-indigo-900/70 bg-indigo-950/20 p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-indigo-200">Your founder journey</h3>
                  <p className="text-[11px] text-slate-400 mt-1">This helps the council tailor its advice to your path and capacity. You can change it as things evolve.</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Where are you in your founder journey?</label>
                  <select value={profile.careerPath || DEFAULT_FOUNDER_PROFILE.careerPath} onChange={e => setProfile({ ...profile, careerPath: e.target.value })} className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200">
                    {['First-time founder', 'Professional transitioning from a full-time job', 'College student / campus founder', 'Building alongside another job', 'Repeat founder', 'Other path'].map(option => <option key={option}>{option}</option>)}
                  </select>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary support / funding</label>
                    <select value={profile.supportSource || DEFAULT_FOUNDER_PROFILE.supportSource} onChange={e => setProfile({ ...profile, supportSource: e.target.value })} className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200">
                      {['Personal savings / bootstrapping', 'College / entrepreneurship cell', 'Job income / severance', 'Grants / incubator', 'Revenue from customers', 'Angel / venture funding', 'Mixed or other'].map(option => <option key={option}>{option}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Time available</label>
                    <select value={profile.hoursPerWeek || DEFAULT_FOUNDER_PROFILE.hoursPerWeek} onChange={e => setProfile({ ...profile, hoursPerWeek: e.target.value })} className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200">
                      {['Part-time (under 10 hours)', 'Part-time (10–20 hours)', 'Part-time (20–30 hours)', 'Full-time'].map(option => <option key={option}>{option}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2 transition"
              >
                <span>Confirm & Enter Chamber</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STAGE 4: INDUCTION */}
        {stage === 'induction' && (
          <div className="max-w-2xl mx-auto py-10 text-center space-y-6">
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-cyan-950/70 border-2 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.5)]">
              <ShieldCheck className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800">
                Protocol: Clearance Founder-Omega Granted
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Welcome to the Chamber, {profile.name}.</h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto">
                Inducted as <strong className="text-cyan-300">{profile.role}</strong> of <strong className="text-indigo-300">{profile.companyName || 'your venture'}</strong>.
              </p>
            </div>
            <button
              onClick={() => { setIntroBotIndex(0); setStage('meet_council'); }}
              className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 mx-auto transition"
            >
              <span>Meet Your 5 AI Council Bots</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STAGE 5: MEET COUNCIL */}
        {stage === 'meet_council' && (
          <div className="max-w-2xl mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400">Stage 5: Council Orientation</span>
                <h3 className="text-lg font-black text-white">Meet Your Advisors</h3>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                {introBotIndex + 1} / {COUNCIL_PERSONAS.length}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {COUNCIL_PERSONAS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setIntroBotIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${idx === introBotIndex ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : idx < introBotIndex ? 'bg-cyan-800' : 'bg-slate-800'}`}
                />
              ))}
            </div>
            {(() => {
              const bot = COUNCIL_PERSONAS[introBotIndex];
              return (
                <div className={`p-6 sm:p-8 rounded-2xl ${bot.bgColor} border ${bot.borderColor} backdrop-blur-xl shadow-2xl space-y-6`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-2xl font-black text-white">
                      {bot.avatarSymbol}
                    </div>
                    <div>
                      <h2 className={`text-2xl font-black ${bot.textColor}`}>{bot.name}</h2>
                      <p className="text-sm font-semibold text-slate-200">{bot.role}</p>
                      <p className="text-xs text-slate-400 font-mono">{bot.title}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-200 leading-relaxed italic">
                    "{bot.introductionQuote}"
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bot.expertise.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                    <button
                      disabled={introBotIndex === 0}
                      onClick={() => setIntroBotIndex(p => p - 1)}
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 disabled:opacity-30 flex items-center space-x-1.5 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    {introBotIndex < COUNCIL_PERSONAS.length - 1 ? (
                      <button
                        onClick={() => setIntroBotIndex(p => p + 1)}
                        className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition"
                      >
                        <span>Next: {COUNCIL_PERSONAS[introBotIndex + 1].name}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setStage('vision_input')}
                        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-[0_0_25px_rgba(6,182,212,0.5)] transition"
                      >
                        <span>Share Your Vision</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* STAGE 6: VISION INPUT */}
        {stage === 'vision_input' && (
          <div className="max-w-2xl mx-auto py-6 space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400">Stage 6: Vision Submission</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">What are you building, {profile.name}?</h2>
              <p className="text-xs text-slate-400 mt-1">Speak or type your raw core thesis. Both Gemini and Gemma are primed to deliberate.</p>
            </div>

            {/* Gemma In-Browser Readiness Banner */}
            {typeof (navigator as any).gpu !== 'undefined' && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-700/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-emerald-300">
                    <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">Local SLM: Gemma 2 2B (In-Browser WebGPU)</span>
                  </div>
                  {gemmaStatus === 'idle' && (
                    <button
                      onClick={initWebLLMEngine}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
                    >
                      Pre-Warm Gemma
                    </button>
                  )}
                  {gemmaStatus === 'ready' && (
                    <span className="flex items-center space-x-1 text-[11px] font-mono text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active & Cached</span>
                    </span>
                  )}
                </div>
                {gemmaStatus === 'loading' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-emerald-300">
                      <span>{gemmaProgress}</span>
                      <span>{gemmaDownloadPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-150" style={{ width: `${gemmaDownloadPct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.8)] scale-105' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'}`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono text-slate-400">
                    <span>{isRecording ? 'STREAMING VOICE...' : 'Voice input idle (Web Speech API)'}</span>
                    {isRecording && <span className="text-red-400 animate-pulse">● LIVE</span>}
                  </div>
                  <div className="flex items-center space-x-1 h-8 px-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    {audioWaveform.map((h, i) => (
                      <div key={i} className="w-1.5 rounded-full bg-cyan-400 transition-all duration-100" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                rows={4}
                value={visionText}
                onChange={e => setVisionText(e.target.value)}
                placeholder="Describe your startup vision in plain language (e.g. what are you building, who is the customer, what is your unfair advantage?)..."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 resize-none"
              />

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Quick Demo Scenarios:</span>
                <div className="flex flex-wrap gap-2">
                  {DEMO_VISIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setVisionText(item.text)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
                  <span>Deliberation Engine:</span>
                  <select
                    value={enginePreference}
                    onChange={e => setEnginePreference(e.target.value as EnginePreference)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="auto">Auto (Gemini Flagship + Gemma)</option>
                    <option value="gemini">Gemini Cloud Only</option>
                    <option value="gemma">Gemma 2 2B In-Browser</option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={!visionText.trim()}
                  onClick={() => triggerCouncilDeliberation()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Convene AI Council</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 7: DELIBERATION */}
        {stage === 'deliberation' && (
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400">Stage 7: Live Council Deliberation</span>
                <h2 className="text-xl sm:text-2xl font-black text-white">Advisors Deliberating</h2>
              </div>
              <div className="flex items-center space-x-2">
                {activeModel && (() => {
                  const { label, color, dot } = getTierLabel(activeModel);
                  return (
                    <span className={`flex items-center space-x-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 ${color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      <span>{label}</span>
                    </span>
                  );
                })()}
                {isDeliberating ? (
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <span className="text-xs font-mono text-emerald-400">Completed</span>
                )}
              </div>
            </div>

            {gemmaStatus === 'loading' && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-300">
                  <span className="flex items-center space-x-2">
                    <Download className="w-3.5 h-3.5 animate-bounce" />
                    <span>{gemmaProgress}</span>
                  </span>
                  <span className="font-mono">{gemmaDownloadPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${gemmaDownloadPct}%` }} />
                </div>
              </div>
            )}

            <div className="space-y-4">
              {deliberationFeed.map((thought, index) => {
                const persona = COUNCIL_PERSONAS.find(p => p.id === thought.id) || COUNCIL_PERSONAS[0];
                return (
                  <div
                    key={index}
                    className={`p-5 rounded-2xl ${persona.bgColor} border ${persona.borderColor} space-y-2 backdrop-blur-md shadow-lg transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className={`text-base font-black ${persona.textColor}`}>{thought.personaName}</span>
                        <span className="text-xs text-slate-400">({thought.role})</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        Advisor #{index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-slate-100 leading-relaxed font-sans">{thought.thought}</p>
                  </div>
                );
              })}
            </div>

            {synthesis && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.25)] space-y-4">
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                  <div className="flex items-center space-x-2 text-cyan-400">
                    <ShieldCheck className="w-5 h-5" />
                    <h4 className="text-xs font-extrabold uppercase tracking-widest">Unified Council Directive</h4>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Risk Assessment: {synthesis.riskFactor || 'Moderate'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Verdict:</span>
                  <p className="text-sm font-semibold text-slate-100 mt-1 leading-relaxed">{synthesis.verdict}</p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Priority Directives:</span>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {synthesis.actionItems.map((act, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-cyan-400 font-bold shrink-0">►</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {activeModel && (() => {
                  const { label, color } = getTierLabel(activeModel);
                  return <p className={`text-[10px] font-mono pt-1 ${color}`}>Cognitive Engine: {label}</p>;
                })()}
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStage('evaluation_sheet')}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center space-x-2 transition"
                  >
                    <span>Stage 8: Evaluation Sheet</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STAGE 8: EVALUATION SHEET */}
        {stage === 'evaluation_sheet' && (
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400">Stage 8: Continuous Tracking Loop</span>
                <h2 className="text-2xl font-black text-white">Startup Evaluation Sheet</h2>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                Cycle #{ventureHistory.length + 1}
              </span>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-5 shadow-2xl">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Current Startup Stage</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                  {['Idea & Architecture', 'MVP Sprint', 'Closed Beta', 'Traction / Scaling'].map(stg => (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => setEvalSheet({ ...evalSheet, currentStage: stg })}
                      className={`p-2 rounded-lg text-xs font-semibold text-center border transition ${evalSheet.currentStage === stg ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                    >
                      {stg}
                    </button>
                  ))}
                </div>
              </div>

              {([
                ['Immediate Sprint Priority', 'topPriority'],
                ['Critical Bottleneck', 'criticalBottleneck'],
                ['Next Target Milestone', 'nextMilestone'],
                ['Estimated Runway', 'runwayMonths']
              ] as [string, keyof EvaluationSheet][]).map(([label, key]) => (
                <div key={key}>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">{label}</label>
                  <input
                    type="text"
                    value={evalSheet[key] as string}
                    onChange={e => setEvalSheet({ ...evalSheet, [key]: e.target.value })}
                    className="w-full mt-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              ))}

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-300 font-mono">Founder Morale & Energy</span>
                  <span className="font-mono text-cyan-400 font-bold">{evalSheet.confidenceScore} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={evalSheet.confidenceScore}
                  onChange={e => setEvalSheet({ ...evalSheet, confidenceScore: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[11px] text-yellow-400/90 italic">
                  D.U.M.-E: "{evalSheet.confidenceScore >= 8 ? 'Incredible energy! Keep shipping.' : evalSheet.confidenceScore >= 5 ? 'Steady pace. Win one thing today.' : 'Rest. Recharge. This is a long marathon.'}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCommitEvaluation}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Save Snapshot</span>
                </button>
                <button
                  type="button"
                  onClick={handleStartNewLoop}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Next Loop: Re-convene Council</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === 'workspace' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">{isShowcaseDemo ? 'Sample demo workspace · Founder view' : 'Founder workspace · Venture HQ'}</span>
                <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">{profile.companyName || 'Your startup'}</h1>
                <p className="text-sm text-slate-400 mt-1">A living view of your venture, your next moves, and the people in your corner.</p>
              </div>
              <div className="flex items-center gap-2">
                {isShowcaseDemo && <button onClick={() => setStage('welcome')} className="px-3 py-2 rounded-lg border border-slate-700 text-slate-400 text-xs hover:text-white">Back to welcome</button>}
                <button onClick={handleStartNewLoop} className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)]"><RefreshCw className="w-4 h-4" /> Convene AI Council</button>
              </div>
            </div>

            {workspaceTab === 'overview' && (
              <div className="space-y-5">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5"><div className="text-[10px] uppercase font-mono text-slate-500">Current stage</div><div className="text-lg font-bold text-white mt-2">{evalSheet.currentStage}</div><div className="text-xs text-cyan-300 mt-2">Cycle #{ventureHistory.length || 1}</div></div>
                  <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5"><div className="text-[10px] uppercase font-mono text-slate-500">Founder energy</div><div className="text-3xl font-black text-yellow-300 mt-1">{evalSheet.confidenceScore}<span className="text-sm text-slate-500"> / 10</span></div><div className="h-1.5 bg-slate-800 rounded-full mt-3"><div className="h-full bg-yellow-400 rounded-full" style={{ width: `${evalSheet.confidenceScore * 10}%` }} /></div></div>
                  <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5"><div className="text-[10px] uppercase font-mono text-slate-500">Runway estimate</div><div className="text-lg font-bold text-white mt-2">{evalSheet.runwayMonths}</div><div className="text-xs text-slate-500 mt-2">Update this in your evaluation snapshot</div></div>
                </div>
                <section className="rounded-2xl bg-slate-900/70 border border-indigo-900/70 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-4"><div><h2 className="font-bold text-white">Founder journey & capacity</h2><p className="text-xs text-slate-500 mt-1">The council uses these details to size recommendations to your real life.</p></div><span className="text-[10px] text-indigo-300">Saved automatically</span></div>
                  <div className="grid md:grid-cols-3 gap-3">
                    {([
                      ['Career path', 'careerPath', ['First-time founder', 'Professional transitioning from a full-time job', 'College student / campus founder', 'Building alongside another job', 'Repeat founder', 'Other path']],
                      ['Support / funding', 'supportSource', ['Personal savings / bootstrapping', 'College / entrepreneurship cell', 'Job income / severance', 'Grants / incubator', 'Revenue from customers', 'Angel / venture funding', 'Mixed or other']],
                      ['Time available', 'hoursPerWeek', ['Part-time (under 10 hours)', 'Part-time (10–20 hours)', 'Part-time (20–30 hours)', 'Full-time']]
                    ] as [string, 'careerPath' | 'supportSource' | 'hoursPerWeek', string[]][]).map(([label, key, options]) => <label key={key} className="text-[10px] uppercase tracking-wider font-mono text-slate-500">{label}<select value={profile[key] || DEFAULT_FOUNDER_PROFILE[key]} onChange={event => setProfile(prev => ({ ...prev, [key]: event.target.value }))} className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs normal-case tracking-normal font-sans text-slate-200">{options.map(option => <option key={option}>{option}</option>)}</select></label>)}
                  </div>
                </section>
                <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-4">
                  <section className="rounded-2xl bg-slate-900/80 border border-cyan-900/70 p-5 space-y-4">
                    <div className="flex items-center gap-2 text-cyan-300"><Target className="w-4 h-4"/><h2 className="font-bold">Your focus right now</h2></div>
                    <div><div className="text-[10px] uppercase font-mono text-slate-500">Immediate priority</div><p className="text-white font-semibold mt-1">{evalSheet.topPriority}</p></div>
                    <div className="grid sm:grid-cols-2 gap-3"><div className="p-3 rounded-xl bg-slate-950/80"><div className="text-[10px] uppercase font-mono text-red-300">Bottleneck</div><p className="text-sm text-slate-200 mt-1">{evalSheet.criticalBottleneck}</p></div><div className="p-3 rounded-xl bg-slate-950/80"><div className="text-[10px] uppercase font-mono text-emerald-300">Next milestone</div><p className="text-sm text-slate-200 mt-1">{evalSheet.nextMilestone}</p></div></div>
                    {synthesis && <div className="border-t border-slate-800 pt-3"><div className="text-[10px] uppercase font-mono text-slate-500">Latest council directive</div><p className="text-sm text-slate-200 mt-1">{synthesis.verdict}</p></div>}
                    <button onClick={() => setStage('evaluation_sheet')} className="text-xs text-cyan-300 hover:text-cyan-200">Update venture evaluation →</button>
                  </section>
                  <section className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5"><h2 className="font-bold text-white">Your council</h2><p className="text-xs text-slate-500 mt-1">Five perspectives, available whenever you need them.</p><div className="mt-4 space-y-2">{COUNCIL_PERSONAS.map(persona => <button key={persona.id} onClick={() => { setSelectedAdvisorId(persona.id); setWorkspaceTab('advisor'); }} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 text-left"><span className={`w-8 h-8 rounded-lg ${persona.bgColor} ${persona.textColor} grid place-items-center font-black`}>{persona.avatarSymbol}</span><span><span className={`block text-xs font-bold ${persona.textColor}`}>{persona.name}</span><span className="block text-[10px] text-slate-500">{persona.role}</span></span><ChevronRight className="w-4 h-4 ml-auto text-slate-600" /></button>)}</div></section>
                </div>
                <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5"><div className="flex justify-between items-center"><h2 className="font-bold text-white">Recent venture activity</h2><button onClick={() => setShowHistoryDrawer(true)} className="text-xs text-cyan-300">Full trajectory →</button></div>{ventureHistory.slice(0, 3).length ? <div className="mt-3 grid md:grid-cols-3 gap-3">{ventureHistory.slice(0, 3).map(item => <div key={item.id} className="p-3 rounded-xl bg-slate-950/70"><div className="text-[10px] font-mono text-cyan-400">CYCLE #{item.cycleNumber} · {item.timestamp}</div><p className="text-xs text-slate-300 mt-2 line-clamp-3">{item.councilVerdict}</p></div>)}</div> : <p className="text-sm text-slate-500 mt-3">Your saved council cycles will appear here.</p>}</div>
              </div>
            )}

            {workspaceTab === 'roadmap' && (
              <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-7">
                <span className="text-[10px] font-mono uppercase text-cyan-400">Venture roadmap</span><h2 className="text-2xl font-black text-white mt-1">The next chapters</h2><p className="text-sm text-slate-400 mt-1">A simple stage map. Update your current stage and milestone as the company moves.</p>
                <div className="mt-8 grid md:grid-cols-4 gap-3">{['Idea & Architecture', 'MVP Sprint', 'Closed Beta', 'Traction / Scaling'].map((roadmapStage, index) => { const current = roadmapStage === evalSheet.currentStage; const completed = ['Idea & Architecture', 'MVP Sprint', 'Closed Beta', 'Traction / Scaling'].indexOf(evalSheet.currentStage) > index; return <button key={roadmapStage} onClick={() => setEvalSheet(prev => ({ ...prev, currentStage: roadmapStage }))} className={`relative text-left p-4 rounded-xl border min-h-36 ${current ? 'border-cyan-500 bg-cyan-950/50 shadow-[0_0_25px_rgba(6,182,212,0.12)]' : completed ? 'border-emerald-800 bg-emerald-950/20' : 'border-slate-800 bg-slate-950/60'}`}><div className={`w-8 h-8 rounded-full grid place-items-center font-bold text-sm ${current ? 'bg-cyan-400 text-slate-950' : completed ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>{completed ? '✓' : index + 1}</div><h3 className="text-sm font-bold text-white mt-4">{roadmapStage}</h3><p className="text-[11px] text-slate-500 mt-1">{current ? 'Current chapter' : completed ? 'Previous chapter' : 'Up next'}</p>{index < 3 && <div className="hidden md:block absolute top-8 -right-3 w-3 h-px bg-slate-700"/>}</button>; })}</div>
                <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid sm:grid-cols-2 gap-4"><div><div className="text-[10px] uppercase font-mono text-cyan-400">Next milestone</div><p className="text-sm text-slate-200 mt-1">{evalSheet.nextMilestone}</p></div><div><div className="text-[10px] uppercase font-mono text-red-300">Current bottleneck</div><p className="text-sm text-slate-200 mt-1">{evalSheet.criticalBottleneck}</p></div></div>
                <button onClick={() => setStage('evaluation_sheet')} className="mt-4 px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-cyan-500">Edit roadmap details</button>
              </section>
            )}

            {workspaceTab === 'council' && (
              <div className="space-y-4"><div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5"><h2 className="text-xl font-black text-white">Convene the council</h2><p className="text-sm text-slate-400 mt-1">Bring all five advisors back around your current venture thesis.</p><button onClick={handleStartNewLoop} className="mt-4 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-sm font-bold flex items-center gap-2"><Users className="w-4 h-4"/>Start a new council session</button></div><div className="grid sm:grid-cols-2 gap-3">{COUNCIL_PERSONAS.map(persona => <button key={persona.id} onClick={() => { setSelectedAdvisorId(persona.id); setWorkspaceTab('advisor'); }} className={`p-4 rounded-2xl text-left border ${persona.borderColor} ${persona.bgColor}`}><div className={`font-black ${persona.textColor}`}>{persona.name}</div><div className="text-xs text-slate-300 mt-1">{persona.role}</div><p className="text-xs text-slate-500 mt-2">{persona.tagline}</p><span className="inline-block text-[10px] text-cyan-300 mt-3">Talk one-on-one →</span></button>)}</div>{deliberationFeed.length > 0 && <div className="space-y-3"><h3 className="font-bold text-white">Latest council session</h3>{deliberationFeed.map(thought => <div key={thought.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800"><div className="text-xs font-bold text-cyan-300">{thought.personaName}</div><p className="text-sm text-slate-300 mt-1">{thought.thought}</p></div>)}</div>}</div>
            )}

            {workspaceTab === 'advisor' && (() => { const advisor = COUNCIL_PERSONAS.find(persona => persona.id === selectedAdvisorId) || COUNCIL_PERSONAS[0]; const messages = advisorChats[advisor.id] || []; return <div className="max-w-3xl mx-auto rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden"><div className="p-4 border-b border-slate-800 flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${advisor.bgColor} ${advisor.textColor} grid place-items-center font-black`}>{advisor.avatarSymbol}</div><div><h2 className={`font-bold ${advisor.textColor}`}>Talk with {advisor.name}</h2><p className="text-[11px] text-slate-500">{advisor.role} · {advisor.tagline}</p></div><select value={advisor.id} onChange={event => setSelectedAdvisorId(event.target.value)} className="ml-auto max-w-36 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs">{COUNCIL_PERSONAS.map(persona => <option key={persona.id} value={persona.id}>{persona.name}</option>)}</select></div><div className="min-h-80 max-h-[55vh] overflow-y-auto p-4 space-y-3">{messages.length === 0 && <div className="text-center py-16"><MessageCircle className={`w-8 h-8 mx-auto ${advisor.textColor}`} /><p className="text-sm text-white mt-3">What’s on your mind?</p><p className="text-xs text-slate-500 mt-1">Ask for a second opinion, a next step, or help untangling a decision.</p></div>}{messages.map((message, index) => <div key={index} className={`max-w-[88%] p-3 rounded-xl text-sm whitespace-pre-wrap ${message.role === 'founder' ? 'ml-auto bg-cyan-950 text-cyan-50' : 'bg-slate-950 border border-slate-800 text-slate-200'}`}>{message.text}</div>)}{advisorBusy && <div className="text-xs text-slate-500 animate-pulse">{advisor.name} is thinking…</div>}</div><form onSubmit={event => { event.preventDefault(); void sendAdvisorMessage(); }} className="p-3 border-t border-slate-800 flex gap-2"><input value={advisorInput} onChange={event => setAdvisorInput(event.target.value)} placeholder={`Ask ${advisor.name} anything about the venture…`} className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-cyan-500"/><button disabled={advisorBusy || !advisorInput.trim()} className="px-4 rounded-xl bg-cyan-500 text-slate-950 disabled:opacity-40"><Send className="w-4 h-4"/></button></form></div>; })()}
          </div>
        )}
      </main>

      {/* HISTORY DRAWER */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#090d16] border-l border-slate-800 h-full p-6 space-y-5 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-cyan-400">
                <History className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">Venture Trajectory Log</h3>
              </div>
              <button onClick={() => setShowHistoryDrawer(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {ventureHistory.map(item => {
                const { label, color } = getTierLabel(item.modelUsed);
                return (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                      <span className="text-cyan-400 font-bold">CYCLE #{item.cycleNumber}</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <div className="text-slate-300 font-semibold">"{item.visionSnippet}"</div>
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300">
                      <span className="font-bold text-cyan-400 font-mono uppercase text-[9px] block">Verdict:</span>
                      {item.councilVerdict}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono pt-1">
                      <div>Stage: <strong className="text-slate-200">{item.evaluationSnapshot.currentStage}</strong></div>
                      <div>Morale: <strong className="text-yellow-400">{item.evaluationSnapshot.confidenceScore}/10</strong></div>
                      <div className={`col-span-2 ${color}`}>Cognitive Engine: <strong>{label}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* API KEY & MODEL CONFIGURATION MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Key className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">Dual Intelligence & Model Engine</h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs font-mono">
              {[
                { label: `Gemini Cloud: ${geminiModel === 'custom' && customModelId ? customModelId : geminiModel}`, active: !!geminiApiKey, status: geminiApiKey ? 'Always Active' : 'Key missing', c: 'text-cyan-400', d: geminiApiKey ? 'bg-cyan-400' : 'bg-slate-600' },
                { label: 'Gemma 2 2B: In-Browser SLM (WebGPU)', active: true, status: gemmaStatus === 'ready' ? 'Active & Ready' : gemmaStatus === 'loading' ? 'Loading...' : 'Ready to Warm', c: 'text-emerald-400', d: 'bg-emerald-400' },
                { label: 'Stark Engine: Context Safety Net', active: true, status: 'Standby Fallback Only', c: 'text-amber-400', d: 'bg-amber-500' }
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className={`flex items-center space-x-1.5 ${t.c}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${t.d}`} />
                    <span>{t.label}</span>
                  </span>
                  <span className={t.active ? 'text-emerald-400' : 'text-slate-500'}>{t.status}</span>
                </div>
              ))}
            </div>

            {/* Preferred Engine Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Primary Intelligence Preference
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'auto', label: 'Auto (Dual)' },
                  { id: 'gemini', label: 'Gemini Cloud' },
                  { id: 'gemma', label: 'Gemma Local' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEnginePreference(opt.id as EnginePreference)}
                    className={`py-2 px-1 text-center text-xs font-mono rounded-lg border transition ${enginePreference === opt.id ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
                <span>Gemini Model Endpoint</span>
                <span className="text-[10px] text-cyan-400 font-mono">Auto-Cascade Enabled</span>
              </label>
              <select
                value={geminiModel}
                onChange={e => setGeminiModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Gemini API Key</label>
              <input
                type="password"
                placeholder="AQ.Ab8RN... or AIzaSy..."
                value={geminiApiKey}
                onChange={e => setGeminiApiKey(e.target.value)}
                className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Stored locally in your browser (localStorage). Never bundled into git source code or transmitted to external third-party servers.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem('GEMINI_API_KEY', geminiApiKey);
                    localStorage.setItem('GEMINI_MODEL', geminiModel);
                    localStorage.setItem('GEMINI_CUSTOM_MODEL_ID', customModelId);
                    localStorage.setItem('COUNCIL_ENGINE_PREF', enginePreference);
                  } catch (e) {
                    console.warn(e);
                  }
                  setShowKeyModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="relative z-10 border-t border-slate-900/80 py-4 text-center text-xs text-slate-600 font-mono">
        A.I. Council OS | Gemini 3 Family (Active Cloud) + Gemma 2 2B (Active WebLLM) + Stark Engine (Standby) | Built for Founders
      </footer>
    </div>
  );
}
