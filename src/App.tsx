import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Send, Cpu, Sparkles, ShieldCheck,
  Zap, RefreshCw,
  ChevronRight, ChevronLeft, Key, User, Briefcase, Lock,
  CheckCircle2, ArrowRight, X, History, AlertCircle, Download
} from 'lucide-react';
import { CreateMLCEngine } from '@mlc-ai/web-llm';

// ==========================================
// INTELLIGENCE STACK CONFIGURATION
// ==========================================
// TIER 1 (Primary)   : Google Gemini 2.0 Flash  — via generativelanguage.googleapis.com
//                      Requires an AQ. or AIzaSy Gemini API key (stored in localStorage only).
// TIER 2 (Fallback A): Gemma 2 2B via WebLLM   — runs 100% in-browser via WebGPU.
//                      No API key. Downloads ~1.6 GB on first run, caches to IndexedDB.
// TIER 3 (Fallback B): Built-in Stark Engine    — always works, no network required.
//                      Structured contextual simulation with persona-aware prompts.
// ==========================================

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-pro';
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
  | 'evaluation_sheet';

export type IntelligenceTier = string;

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
  if (tier.includes('2.5-pro')) return { label: 'Gemini 2.5 Pro (Flagship Reasoning)', color: 'text-cyan-400', dot: 'bg-cyan-400' };
  if (tier.includes('1.5-pro')) return { label: 'Gemini 1.5 Pro (Deep Context)', color: 'text-sky-400', dot: 'bg-sky-400' };
  if (tier.includes('2.5-flash')) return { label: 'Gemini 2.5 Flash (Balanced)', color: 'text-blue-400', dot: 'bg-blue-400' };
  if (tier.includes('2.0-flash')) return { label: 'Gemini 2.0 Flash (Fast)', color: 'text-teal-400', dot: 'bg-teal-400' };
  if (tier.startsWith('gemini') || tier.includes('pro') || tier.includes('flash')) return { label: `${tier} (Custom Model)`, color: 'text-cyan-300', dot: 'bg-cyan-300' };
  if (tier === 'gemma_webllm') return { label: 'Gemma 2 2B (WebLLM Local)', color: 'text-emerald-400', dot: 'bg-emerald-400' };
  return { label: 'Stark Engine (Built-in Heuristic)', color: 'text-amber-400', dot: 'bg-amber-500' };
}

export default function App() {
  const [stage, setStage] = useState<AppStage>(() => (localStorage.getItem('COUNCIL_STAGE') as AppStage) || 'welcome');
  const [profile, setProfile] = useState<FounderProfile>(() => {
    try { return JSON.parse(localStorage.getItem('COUNCIL_FOUNDER_PROFILE') || '{}'); } catch { return { name: '', role: 'CEO & Co-Founder', companyName: '', isAuthenticated: false, email: '' }; }
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
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY') || '');
  const [geminiModel, setGeminiModel] = useState<string>(() => localStorage.getItem('GEMINI_MODEL') || DEFAULT_GEMINI_MODEL);
  const [customModelId, setCustomModelId] = useState<string>(() => localStorage.getItem('GEMINI_CUSTOM_MODEL_ID') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const webllmEngineRef = useRef<any>(null);
  const [gemmaStatus, setGemmaStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [gemmaProgress, setGemmaProgress] = useState('');
  const [gemmaDownloadPct, setGemmaDownloadPct] = useState(0);
  const [evalSheet, setEvalSheet] = useState<EvaluationSheet>(() => {
    try { return JSON.parse(localStorage.getItem('COUNCIL_EVAL_SHEET') || '{}'); } catch {
      return { currentStage: 'Idea & Architecture Validation', topPriority: 'Convene AI Council on Core Value Proposition', criticalBottleneck: 'Defining initial MVP scope & legal incorporation', nextMilestone: 'Ship high-fidelity prototype and secure 50 beta signups', runwayMonths: '6 Months', confidenceScore: 8, lastUpdated: new Date().toLocaleDateString() };
    }
  });
  const [ventureHistory, setVentureHistory] = useState<VentureCycleLog[]>(() => {
    try { return JSON.parse(localStorage.getItem('COUNCIL_VENTURE_HISTORY') || '[]'); } catch { return []; }
  });
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  useEffect(() => { localStorage.setItem('COUNCIL_STAGE', stage); }, [stage]);
  useEffect(() => { localStorage.setItem('COUNCIL_FOUNDER_PROFILE', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('COUNCIL_EVAL_SHEET', JSON.stringify(evalSheet)); }, [evalSheet]);
  useEffect(() => { localStorage.setItem('COUNCIL_VENTURE_HISTORY', JSON.stringify(ventureHistory)); }, [ventureHistory]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    let interval: any;
    if (isRecording) interval = setInterval(() => setAudioWaveform(Array.from({ length: 12 }, () => Math.floor(Math.random() * 75) + 20)), 100);
    else setAudioWaveform([15, 15, 15, 15, 15, 15, 15, 15]);
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!recognitionRef.current) { alert('Speech recognition not supported. Type or select a demo.'); return; }
    if (isRecording) { recognitionRef.current.stop(); setIsRecording(false); }
    else { try { recognitionRef.current.start(); setIsRecording(true); } catch (e) { console.warn(e); } }
  };

  const handleDummyLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) { setAuthError('Please enter an email and password.'); return; }
    setAuthError('');
    setProfile(prev => ({ ...prev, email: authEmail, isAuthenticated: true }));
    setStage('profile');
  };

  const handleInstantDemoLogin = () => {
    setAuthEmail('founder@starklabs.io');
    setAuthPassword('supersecretfounder123');
    setAuthError('');
    setProfile(prev => ({ ...prev, email: 'founder@starklabs.io', isAuthenticated: true, name: prev.name || 'Tony Stark', companyName: prev.companyName || 'Arc Reactor Technologies' }));
    setStage('profile');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) { alert('Please enter your name.'); return; }
    if (!profile.companyName.trim()) setProfile(prev => ({ ...prev, companyName: 'Venture Stealth' }));
    setStage('induction');
  };

  const streamFeedItems = async (items: any[], delayMs: number) => {
    for (const item of items) {
      const persona = COUNCIL_PERSONAS.find(p => p.id === item.id) || COUNCIL_PERSONAS[0];
      setActiveSpeakerId(item.id);
      await new Promise(r => setTimeout(r, delayMs));
      setDeliberationFeed(prev => [...prev, { id: item.id, personaName: persona.name, role: persona.role, thought: item.thought, status: 'completed' }]);
    }
    setActiveSpeakerId(null);
  };

  const autoUpdateEvalSheet = (topAction?: string) => {
    if (topAction) setEvalSheet(prev => ({ ...prev, topPriority: topAction, lastUpdated: new Date().toLocaleTimeString() }));
  };

  // ==========================================
  // TIER 1: Google Gemini (2.5 Pro / Flagship Reasoning Model)
  // ==========================================
  const executeGeminiDeliberation = async (vision: string, modelId: string): Promise<void> => {
    const prompt = `You are the elite AI Founders Council (Tony Stark style AI OS).
Founder: ${profile.name} (${profile.role})
Venture: ${profile.companyName}
Raw Venture Vision: "${vision}"

Conduct an incisive, world-class founder council deliberation. Each advisor must bring rigorous domain critique and actionable strategy according to their role.
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
    if (!res.ok) throw new Error(`Gemini (${modelId}) HTTP ${res.status}`);
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(text);
    await streamFeedItems(parsed.council || [], 800);
    setSynthesis(parsed.synthesis);
    setActiveModel(modelId);
    autoUpdateEvalSheet(parsed.synthesis?.actionItems?.[0]);
  };

  // ==========================================
  // TIER 2: Gemma 2 2B via WebLLM
  // ==========================================
  const initWebLLMEngine = async (): Promise<any> => {
    if (webllmEngineRef.current) return webllmEngineRef.current;
    setGemmaStatus('loading');
    setGemmaProgress('Initializing Gemma 2 2B engine...');
    setGemmaDownloadPct(0);
    const engine = await CreateMLCEngine(GEMMA_WEBLLM_MODEL, {
      initProgressCallback: (report: any) => {
        setGemmaProgress(report.text || 'Loading...');
        if (typeof report.progress === 'number') setGemmaDownloadPct(Math.round(report.progress * 100));
      }
    });
    webllmEngineRef.current = engine;
    setGemmaStatus('ready');
    setGemmaProgress('Gemma 2 2B ready.');
    return engine;
  };

  const executeGemmaDeliberation = async (vision: string): Promise<void> => {
    const engine = await initWebLLMEngine();
    const personaPrompts = [
      { id: 'jarvis', system: 'You are J.A.R.V.I.S., an AI governance advisor for startup founders. Give structured advice on legal compliance, entity formation, cap tables, and operational execution. Be concise and formal.' },
      { id: 'friday', system: 'You are F.R.I.D.A.Y., an AI product & technical advisor. Give direct advice on MVP architecture, feature scope, technical velocity. Be blunt and practical.' },
      { id: 'edith', system: 'You are E.D.I.T.H., an AI strategy & investor relations advisor. Evaluate the venture from a VC perspective: TAM, competitive moats, unit economics, pitch defensibility. Be analytical.' },
      { id: 'dume', system: 'You are D.U.M.-E, an empathetic AI wellness companion for founders. Provide warm encouragement, celebrate progress, remind about work-life balance. Be warm and supportive.' },
      { id: 'ultron', system: 'You are ULTRON, a brutally honest AI advisor. Identify the single greatest existential threat to this startup in 2-3 sentences. Be blunt and direct.' }
    ];

    for (const p of personaPrompts) {
      setActiveSpeakerId(p.id);
      const reply = await engine.chat.completions.create({
        messages: [
          { role: 'system', content: p.system },
          { role: 'user', content: `Founder: ${profile.name} (${profile.role}), Venture: ${profile.companyName}. Vision: "${vision}". Give your perspective in 2-3 sentences.` }
        ],
        temperature: 0.75,
        max_tokens: 200
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
        { role: 'user', content: `Summarize a council deliberation on this startup vision: "${vision}"` }
      ],
      temperature: 0.5, max_tokens: 180
    });
    let rawSynth = synthReply.choices[0]?.message?.content?.trim() || '{}';
    rawSynth = rawSynth.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    try {
      const parsed = JSON.parse(rawSynth);
      setSynthesis(parsed);
      autoUpdateEvalSheet(parsed.actionItems?.[0]);
    } catch {
      setSynthesis({ verdict: `Focus on proof of demand for ${profile.companyName || 'your venture'}.`, actionItems: ['Ship the smallest testable version of your core feature.', 'Conduct 5 user problem interviews.', 'Confirm legal incorporation.'], riskFactor: 'Moderate' });
    }
  };

  // ==========================================
  // TIER 3: Built-in Stark Engine
  // ==========================================
  const executeStarkEngine = async (vision: string): Promise<void> => {
    const name = profile.name || 'Founder';
    const venture = profile.companyName || 'the venture';
    const thoughts: CouncilThought[] = [
      { id: 'jarvis', personaName: 'J.A.R.V.I.S.', role: 'Chief of Staff & Governance', thought: `${name}, before external commitments: ensure IP assignment and entity registration are locked. Operational clarity protects the cap table from day one.`, status: 'pending' },
      { id: 'friday', personaName: 'F.R.I.D.A.Y.', role: 'Product & Tech Lead', thought: `Keep ${venture}'s architecture ruthlessly thin. One vertical slice shipped to 20 real users beats a perfect undeployed system. Cut 50% of planned features immediately and focus velocity.`, status: 'pending' },
      { id: 'edith', personaName: 'E.D.I.T.H.', role: 'Strategy & Investor Lens', thought: `Investors will ask why an incumbent cannot replicate this in one quarter. Define your proprietary data flywheel or workflow moat clearly before any pitch conversations.`, status: 'pending' },
      { id: 'dume', personaName: 'D.U.M.-E', role: 'Founder Morale & Wellness', thought: `Having a clear vision for ${venture} is a real achievement, ${name}. Acknowledge that. You are doing the hard thing. Hydrate, rest tonight, and tackle this one sprint at a time.`, status: 'pending' },
      { id: 'ultron', personaName: 'ULTRON', role: 'Reality Check & Tough Love', thought: `${venture} means nothing until 10 people are paying or deeply committed. Stop planning. Get brutal proof of demand before writing another feature. Ideas are infinite. Paying users are not.`, status: 'pending' }
    ];
    for (const t of thoughts) {
      setActiveSpeakerId(t.id);
      await new Promise(r => setTimeout(r, 800));
      setDeliberationFeed(prev => [...prev, { ...t, status: 'completed' }]);
    }
    setActiveSpeakerId(null);
    setActiveModel('stark_engine');
    const directive: CouncilSynthesis = {
      verdict: `Prioritize proof of demand for ${venture} above all else — one paying user validates more than one thousand upvotes.`,
      actionItems: ['1. Cut MVP scope by 50%. Ship the core user flow only.', '2. Schedule 5 problem-discovery interviews with target users this week.', '3. Confirm legal entity and IP assignment before any external commitments.'],
      riskFactor: 'Moderate'
    };
    setSynthesis(directive);
    autoUpdateEvalSheet(directive.actionItems[0]);
  };

  // ==========================================
  // ORCHESTRATOR: 3-Tier Cascade
  // ==========================================
  const triggerCouncilDeliberation = async (overrideVision?: string) => {
    const vision = overrideVision || visionText;
    if (!vision.trim()) { alert('Please describe your venture vision.'); return; }
    setStage('deliberation');
    setIsDeliberating(true);
    setDeliberationFeed([]);
    setSynthesis(null);
    setActiveModel(null);

    // Tier 1: Gemini (Flagship Reasoning Model e.g. 2.5 Pro / Custom, with instant fallback to 2.0 Flash)
    if (geminiApiKey.trim()) {
      const primaryModel = geminiModel === 'custom' && customModelId.trim() ? customModelId.trim() : geminiModel;
      try {
        await executeGeminiDeliberation(vision, primaryModel);
        setIsDeliberating(false);
        return;
      } catch (err) {
        console.warn(`[Tier 1] Primary model (${primaryModel}) failed:`, err);
        if (primaryModel !== 'gemini-2.0-flash') {
          try {
            console.info('[Tier 1 Fallback] Attempting secondary gemini-2.0-flash...');
            await executeGeminiDeliberation(vision, 'gemini-2.0-flash');
            setIsDeliberating(false);
            return;
          } catch (flashErr) {
            console.warn('[Tier 1 Fallback] gemini-2.0-flash also failed:', flashErr);
          }
        }
        setDeliberationFeed([]);
      }
    }

    // Tier 2: Gemma WebLLM (requires WebGPU)
    if (typeof (navigator as any).gpu !== 'undefined') {
      try { await executeGemmaDeliberation(vision); setIsDeliberating(false); return; }
      catch (err) { console.warn('[Tier 2] Gemma WebLLM failed:', err); setDeliberationFeed([]); }
    }

    // Tier 3: Stark Engine
    await executeStarkEngine(vision);
    setIsDeliberating(false);
  };

  const handleCommitEvaluation = () => {
    const cycle: VentureCycleLog = {
      id: `cycle-${Date.now()}`, timestamp: new Date().toLocaleString(), cycleNumber: ventureHistory.length + 1,
      visionSnippet: visionText.slice(0, 120) || 'Core Venture Inception',
      councilVerdict: synthesis?.verdict || 'Council Deliberation Completed',
      evaluationSnapshot: { ...evalSheet, lastUpdated: new Date().toLocaleString() },
      modelUsed: activeModel || 'stark_engine'
    };
    setVentureHistory(prev => [cycle, ...prev]);
    alert(`Cycle #${cycle.cycleNumber} saved to Venture Trajectory.`);
  };

  const handleStartNewLoop = () => { setVisionText(''); setDeliberationFeed([]); setSynthesis(null); setActiveModel(null); setStage('vision_input'); };

  return (
    <div className="min-h-screen bg-[#060810] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black overflow-x-hidden relative flex flex-col">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0" />

      {/* HEADER */}
      <header className="relative z-20 border-b border-slate-800/80 bg-[#060810]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setStage('welcome')}>
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 bg-clip-text text-transparent">A.I. COUNCIL OS</span>
              <p className="text-[10px] text-slate-500 font-mono hidden sm:block">Autonomous Founder Intelligence Nexus</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Stack indicator */}
            <div className="hidden md:flex items-center space-x-2 text-[10px] font-mono">
              {[
                { label: 'Gemini 2.0', active: !!geminiApiKey, color: 'text-cyan-400', dot: 'bg-cyan-400' },
                { label: 'Gemma 2B', active: gemmaStatus === 'ready', color: 'text-emerald-400', dot: 'bg-emerald-400' },
                { label: 'Stark', active: true, color: 'text-amber-400', dot: 'bg-amber-500' }
              ].map((t, i) => (
                <span key={i} className={`flex items-center space-x-1 ${t.active ? t.color : 'text-slate-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${t.active ? t.dot : 'bg-slate-700'}`} />
                  <span>{t.label}</span>
                </span>
              ))}
            </div>
            {profile.name && (
              <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
                <User className="w-3.5 h-3.5 text-cyan-400" /><span className="font-bold text-slate-200">{profile.name}</span>
              </div>
            )}
            {ventureHistory.length > 0 && (
              <button onClick={() => setShowHistoryDrawer(v => !v)} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition">
                <History className="w-3.5 h-3.5 text-cyan-400" /><span className="hidden sm:inline">Log</span>
                <span className="px-1.5 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-mono border border-cyan-800">{ventureHistory.length}</span>
              </button>
            )}
            <button onClick={() => setShowKeyModal(true)} className={`p-2 bg-slate-900/80 border rounded-lg transition ${geminiApiKey ? 'border-cyan-500/40 text-cyan-400' : 'border-slate-800 text-slate-400 hover:text-cyan-400'}`} title="Configure API keys">
              <Key className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">

        {/* STAGE 1: WELCOME */}
        {stage === 'welcome' && (
          <div className="py-12 md:py-16 text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" /><span>3-Tier Intelligence: Gemini 2.0 + Gemma 2 + Stark Engine</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Never Founder Alone.{' '}
              <span className="block bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">Your AI Board of Directors.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              A.I. Council OS convenes 5 specialized AI personas powered by a 3-tier intelligence stack — always works, even offline.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
              {[
                { tier: '1', name: 'Gemini 2.0 Flash', desc: 'Primary generative AI. Needs API key.', border: 'border-cyan-500/40 bg-cyan-950/30', badge: 'text-cyan-400', dot: 'bg-cyan-400' },
                { tier: '2', name: 'Gemma 2 2B', desc: 'Fallback. Runs in browser via WebGPU. Zero API key.', border: 'border-emerald-500/40 bg-emerald-950/30', badge: 'text-emerald-400', dot: 'bg-emerald-400' },
                { tier: '3', name: 'Stark Engine', desc: 'Always-on built-in simulation. No network.', border: 'border-amber-500/40 bg-amber-950/30', badge: 'text-amber-400', dot: 'bg-amber-500' }
              ].map(t => (
                <div key={t.tier} className={`p-3 rounded-xl border ${t.border} space-y-1`}>
                  <div className="flex items-center space-x-1.5"><span className={`w-2 h-2 rounded-full ${t.dot}`} /><span className={`text-xs font-bold font-mono ${t.badge}`}>Tier {t.tier}</span></div>
                  <p className="text-xs font-bold text-slate-200">{t.name}</p>
                  <p className="text-[11px] text-slate-400">{t.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {COUNCIL_PERSONAS.map(bot => (
                <div key={bot.id} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${bot.bgColor} border ${bot.borderColor} text-xs font-semibold`}>
                  <span className={bot.textColor}>●</span><span className="text-slate-200">{bot.name}</span>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <button onClick={() => setStage('auth')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center space-x-2 mx-auto transition">
                <span>Enter Founder Portal</span><ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: AUTH */}
        {stage === 'auth' && (
          <div className="max-w-md mx-auto py-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400"><Lock className="w-6 h-6" /></div>
              <h2 className="text-2xl font-black text-white">Stage 2: Authentication</h2>
              <p className="text-xs text-slate-400">Any email and password accepted. Or use instant demo access.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-5 shadow-2xl">
              {authError && <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-xs text-red-300 flex items-center space-x-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{authError}</span></div>}
              <form onSubmit={handleDummyLogin} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Founder Email</label>
                  <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="founder@venture.com" className="w-full mt-1 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono" />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Passkey</label>
                  <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="any password" className="w-full mt-1 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono" />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition">Verify & Proceed</button>
              </form>
              <div className="relative flex py-2 items-center"><div className="flex-grow border-t border-slate-800" /><span className="mx-3 text-[10px] uppercase font-mono text-slate-500">OR</span><div className="flex-grow border-t border-slate-800" /></div>
              <button type="button" onClick={handleInstantDemoLogin} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 transition">
                <Zap className="w-4 h-4 text-cyan-400" /><span>Instant 1-Click Founder Demo Access</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: PROFILE */}
        {stage === 'profile' && (
          <div className="max-w-xl mx-auto py-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400"><Briefcase className="w-6 h-6" /></div>
              <h2 className="text-2xl font-black text-white">Stage 3: Founder Credentials</h2>
              <p className="text-xs text-slate-400">Your role shapes how each AI advisor prioritizes their analysis.</p>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-5 shadow-2xl">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Your Name</label>
                <input type="text" required value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="e.g. Tony Stark, Maya Lin" className="w-full mt-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Role</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {['CEO & Co-Founder', 'Technical Co-Founder / CTO', 'Solo Builder / Founder', 'Head of Product', 'General Partner / COO', 'Other Builder'].map(r => (
                    <button type="button" key={r} onClick={() => setProfile({ ...profile, role: r })} className={`p-2.5 rounded-lg text-xs font-medium text-left border transition ${profile.role === r ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'}`}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Venture Working Title</label>
                <input type="text" value={profile.companyName} onChange={e => setProfile({ ...profile, companyName: e.target.value })} placeholder="e.g. Arc Reactor Labs (optional)" className="w-full mt-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2 transition">
                <span>Confirm & Enter Chamber</span><ChevronRight className="w-4 h-4" />
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
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800">Protocol: Clearance Founder-Omega Granted</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Welcome to the Chamber, {profile.name}.</h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto">Inducted as <strong className="text-cyan-300">{profile.role}</strong> of <strong className="text-indigo-300">{profile.companyName || 'your venture'}</strong>.</p>
            </div>
            <button onClick={() => { setIntroBotIndex(0); setStage('meet_council'); }} className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 mx-auto transition">
              <span>Meet Your 5 AI Council Bots</span><ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STAGE 5: MEET COUNCIL */}
        {stage === 'meet_council' && (
          <div className="max-w-2xl mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div><span className="text-[10px] font-mono uppercase text-cyan-400">Stage 5: Council Orientation</span><h3 className="text-lg font-black text-white">Meet Your Advisors</h3></div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">{introBotIndex + 1} / {COUNCIL_PERSONAS.length}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {COUNCIL_PERSONAS.map((_, idx) => (
                <button key={idx} onClick={() => setIntroBotIndex(idx)} className={`h-1.5 rounded-full transition-all ${idx === introBotIndex ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : idx < introBotIndex ? 'bg-cyan-800' : 'bg-slate-800'}`} />
              ))}
            </div>
            {(() => {
              const bot = COUNCIL_PERSONAS[introBotIndex];
              return (
                <div className={`p-6 sm:p-8 rounded-2xl ${bot.bgColor} border ${bot.borderColor} backdrop-blur-xl shadow-2xl space-y-6`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-2xl font-black text-white">{bot.avatarSymbol}</div>
                    <div><h2 className={`text-2xl font-black ${bot.textColor}`}>{bot.name}</h2><p className="text-sm font-semibold text-slate-200">{bot.role}</p><p className="text-xs text-slate-400 font-mono">{bot.title}</p></div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-200 leading-relaxed italic">"{bot.introductionQuote}"</div>
                  <div className="flex flex-wrap gap-2">{bot.expertise.map((s, i) => <span key={i} className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs text-slate-300">{s}</span>)}</div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                    <button disabled={introBotIndex === 0} onClick={() => setIntroBotIndex(p => p - 1)} className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 disabled:opacity-30 flex items-center space-x-1.5 transition">
                      <ChevronLeft className="w-4 h-4" /><span>Previous</span>
                    </button>
                    {introBotIndex < COUNCIL_PERSONAS.length - 1 ? (
                      <button onClick={() => setIntroBotIndex(p => p + 1)} className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition">
                        <span>Next: {COUNCIL_PERSONAS[introBotIndex + 1].name}</span><ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => setStage('vision_input')} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-[0_0_25px_rgba(6,182,212,0.5)] transition">
                        <span>Share Your Vision</span><ArrowRight className="w-4 h-4" />
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
            <div><span className="text-[10px] font-mono uppercase text-cyan-400">Stage 6: Vision Submission</span><h2 className="text-2xl sm:text-3xl font-black text-white">What are you building, {profile.name}?</h2><p className="text-xs text-slate-400 mt-1">No business plan required. Speak or type the raw core thesis of your venture.</p></div>

            {typeof (navigator as any).gpu !== 'undefined' && gemmaStatus === 'idle' && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/40 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-emerald-300"><Download className="w-4 h-4 shrink-0" /><span>Pre-load Gemma 2 2B for offline fallback (~1.6 GB, cached after first download)</span></div>
                <button onClick={initWebLLMEngine} className="ml-3 shrink-0 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition text-xs">Pre-load</button>
              </div>
            )}
            {gemmaStatus === 'loading' && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-300">
                  <span className="flex items-center space-x-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>{gemmaProgress}</span></span>
                  <span className="font-mono">{gemmaDownloadPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${gemmaDownloadPct}%` }} /></div>
              </div>
            )}
            {gemmaStatus === 'ready' && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-700/40 text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" /><span>Gemma 2 2B loaded and ready in browser (WebLLM)</span>
              </div>
            )}

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                <button type="button" onClick={toggleRecording} className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.8)] scale-105' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'}`}>
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono text-slate-400">
                    <span>{isRecording ? 'STREAMING VOICE...' : 'Voice input idle'}</span>
                    {isRecording && <span className="text-red-400 animate-pulse">● LIVE</span>}
                  </div>
                  <div className="flex items-center space-x-1 h-8 px-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    {audioWaveform.map((h, i) => <div key={i} className="w-1.5 rounded-full bg-cyan-400 transition-all duration-100" style={{ height: `${h}%` }} />)}
                  </div>
                </div>
              </div>
              <textarea rows={4} value={visionText} onChange={e => setVisionText(e.target.value)} placeholder="Describe your startup vision in plain language..." className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 resize-none" />
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Quick Demo Scenarios:</span>
                <div className="flex flex-wrap gap-2">
                  {DEMO_VISIONS.map((item, idx) => (
                    <button key={idx} type="button" onClick={() => setVisionText(item.text)} className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition">{item.title}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="button" disabled={!visionText.trim()} onClick={() => triggerCouncilDeliberation()} className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center space-x-2 transition">
                  <Send className="w-4 h-4" /><span>Convene AI Council</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 7: DELIBERATION */}
        {stage === 'deliberation' && (
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div><span className="text-[10px] font-mono uppercase text-cyan-400">Stage 7: Live Council Deliberation</span><h2 className="text-xl sm:text-2xl font-black text-white">Advisors Deliberating</h2></div>
              <div className="flex items-center space-x-2">
                {activeModel && (() => { const { label, color, dot } = getTierLabel(activeModel); return <span className={`hidden sm:flex items-center space-x-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 ${color}`}><span className={`w-1.5 h-1.5 rounded-full ${dot}`} /><span>{label}</span></span>; })()}
                {isDeliberating ? <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400"><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Analyzing...</span></div> : <span className="text-xs font-mono text-emerald-400">Done</span>}
              </div>
            </div>

            {gemmaStatus === 'loading' && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-300">
                  <span className="flex items-center space-x-2"><Download className="w-3.5 h-3.5 animate-bounce" /><span>{gemmaProgress}</span></span>
                  <span className="font-mono">{gemmaDownloadPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${gemmaDownloadPct}%` }} /></div>
              </div>
            )}

            <div className="space-y-4">
              {deliberationFeed.map((thought, index) => {
                const persona = COUNCIL_PERSONAS.find(p => p.id === thought.id) || COUNCIL_PERSONAS[0];
                return (
                  <div key={index} className={`p-5 rounded-2xl ${persona.bgColor} border ${persona.borderColor} space-y-2 backdrop-blur-md shadow-lg`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5"><span className={`text-base font-black ${persona.textColor}`}>{thought.personaName}</span><span className="text-xs text-slate-400">({thought.role})</span></div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">#{index + 1}</span>
                    </div>
                    <p className="text-sm text-slate-100 leading-relaxed">{thought.thought}</p>
                  </div>
                );
              })}
            </div>

            {synthesis && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.25)] space-y-4">
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                  <div className="flex items-center space-x-2 text-cyan-400"><ShieldCheck className="w-5 h-5" /><h4 className="text-xs font-extrabold uppercase tracking-widest">Unified Council Directive</h4></div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">Risk: {synthesis.riskFactor || 'Moderate'}</span>
                </div>
                <div><span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Verdict:</span><p className="text-sm font-semibold text-slate-100 mt-1 leading-relaxed">{synthesis.verdict}</p></div>
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Priority Actions:</span>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {synthesis.actionItems.map((act, i) => <li key={i} className="flex items-start space-x-2"><span className="text-cyan-400 font-bold shrink-0">►</span><span>{act}</span></li>)}
                  </ul>
                </div>
                {activeModel && (() => { const { label, color } = getTierLabel(activeModel); return <p className={`text-[10px] font-mono pt-1 ${color}`}>Powered by: {label}</p>; })()}
                <div className="pt-4 flex justify-end">
                  <button type="button" onClick={() => setStage('evaluation_sheet')} className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center space-x-2 transition">
                    <span>Stage 8: Evaluation Sheet</span><ArrowRight className="w-4 h-4" />
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
              <div><span className="text-[10px] font-mono uppercase text-cyan-400">Stage 8: Continuous Tracking Loop</span><h2 className="text-2xl font-black text-white">Startup Evaluation Sheet</h2></div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">Cycle #{ventureHistory.length + 1}</span>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-5 shadow-2xl">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Current Startup Stage</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                  {['Idea & Architecture', 'MVP Sprint', 'Closed Beta', 'Traction / Scaling'].map(stg => (
                    <button key={stg} type="button" onClick={() => setEvalSheet({ ...evalSheet, currentStage: stg })} className={`p-2 rounded-lg text-xs font-semibold text-center border transition ${evalSheet.currentStage === stg ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'}`}>{stg}</button>
                  ))}
                </div>
              </div>
              {([['Immediate Sprint Priority', 'topPriority'], ['Critical Bottleneck', 'criticalBottleneck'], ['Next Target Milestone', 'nextMilestone'], ['Estimated Runway', 'runwayMonths']] as [string, keyof EvaluationSheet][]).map(([label, key]) => (
                <div key={key}>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">{label}</label>
                  <input type="text" value={evalSheet[key] as string} onChange={e => setEvalSheet({ ...evalSheet, [key]: e.target.value })} className="w-full mt-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50" />
                </div>
              ))}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs"><span className="font-bold uppercase tracking-wider text-slate-300 font-mono">Founder Morale & Energy</span><span className="font-mono text-cyan-400 font-bold">{evalSheet.confidenceScore} / 10</span></div>
                <input type="range" min="1" max="10" value={evalSheet.confidenceScore} onChange={e => setEvalSheet({ ...evalSheet, confidenceScore: parseInt(e.target.value) })} className="w-full accent-cyan-400 cursor-pointer" />
                <p className="text-[11px] text-yellow-400/90 italic">D.U.M.-E: "{evalSheet.confidenceScore >= 8 ? 'Incredible energy! Keep shipping.' : evalSheet.confidenceScore >= 5 ? 'Steady pace. Win one thing today.' : 'Rest. Recharge. This is a long game.'}"</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                <button type="button" onClick={handleCommitEvaluation} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Save Snapshot</span>
                </button>
                <button type="button" onClick={handleStartNewLoop} className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 transition">
                  <RefreshCw className="w-4 h-4" /><span>Next Loop: Re-convene Council</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* HISTORY DRAWER */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#090d16] border-l border-slate-800 h-full p-6 space-y-5 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-cyan-400"><History className="w-5 h-5" /><h3 className="font-bold text-sm uppercase tracking-wider text-white">Venture Trajectory Log</h3></div>
              <button onClick={() => setShowHistoryDrawer(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {ventureHistory.map(item => {
                const { label, color } = getTierLabel(item.modelUsed);
                return (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]"><span className="text-cyan-400 font-bold">CYCLE #{item.cycleNumber}</span><span>{item.timestamp}</span></div>
                    <div className="text-slate-300 font-semibold">"{item.visionSnippet}"</div>
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300"><span className="font-bold text-cyan-400 font-mono uppercase text-[9px] block">Verdict:</span>{item.councilVerdict}</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono pt-1">
                      <div>Stage: <strong className="text-slate-200">{item.evaluationSnapshot.currentStage}</strong></div>
                      <div>Morale: <strong className="text-yellow-400">{item.evaluationSnapshot.confidenceScore}/10</strong></div>
                      <div className={`col-span-2 ${color}`}>Model: <strong>{label}</strong></div>
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
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">Intelligence Stack & Model Engine</h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs font-mono">
              {[
                { label: `Tier 1: ${geminiModel === 'custom' && customModelId ? customModelId : geminiModel}`, active: !!geminiApiKey, status: geminiApiKey ? 'Key active' : 'No key', c: 'text-cyan-400', d: geminiApiKey ? 'bg-cyan-400' : 'bg-slate-600' },
                { label: 'Tier 2: Gemma 2 2B (WebLLM Local)', active: gemmaStatus === 'ready', status: gemmaStatus === 'ready' ? 'In-browser ready' : gemmaStatus === 'loading' ? 'Loading...' : 'Ready on fallback', c: 'text-emerald-400', d: gemmaStatus === 'ready' ? 'bg-emerald-400' : 'bg-slate-600' },
                { label: 'Tier 3: Stark Engine (Heuristic)', active: true, status: 'Always active', c: 'text-amber-400', d: 'bg-amber-500' }
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

            {/* Model Selection Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
                <span>Primary Reasoning Model</span>
                <span className="text-[10px] text-cyan-400 lowercase font-mono">Flagship Tier 1</span>
              </label>
              <select
                value={geminiModel}
                onChange={e => setGeminiModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Flagship Reasoning & Analysis - Recommended)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Extended Context & Complex Reasoning)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Next-Gen High Speed & Balanced)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Ultra-Fast Generation)</option>
                <option value="custom">Custom Model ID (e.g. gemini-3.1-pro or preview checkpoints)</option>
              </select>
            </div>

            {geminiModel === 'custom' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">Custom Model Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. gemini-3.1-pro or gemini-2.0-pro-exp"
                  value={customModelId}
                  onChange={e => setCustomModelId(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <p className="text-[10px] text-slate-500">Will be routed to Google AI Studio v1beta endpoint with automatic fallback to 2.0 Flash.</p>
              </div>
            )}

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
              <button type="button" onClick={() => setShowKeyModal(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('GEMINI_API_KEY', geminiApiKey);
                  localStorage.setItem('GEMINI_MODEL', geminiModel);
                  localStorage.setItem('GEMINI_CUSTOM_MODEL_ID', customModelId);
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
        A.I. Council OS | Gemini 2.5 Pro (Flagship Reasoning) + Gemma 2 2B (WebLLM) + Stark Engine | Built for Founders
      </footer>
    </div>
  );
}
