import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Send, Cpu, Sparkles, ShieldCheck,
  Terminal, Shield, Flame, Activity, Zap, Layers, RefreshCw,
  ChevronRight, ChevronLeft, Key, User, Briefcase, Lock,
  CheckCircle2, ArrowRight, X, History, AlertCircle, BarChart3, Clock
} from 'lucide-react';

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

export type AppStage =
  | 'welcome'           // 1. Welcome the user
  | 'auth'              // 2. Dummy login validation
  | 'profile'           // 3. Name & Role input
  | 'induction'         // 4. Welcome to the Council
  | 'meet_council'      // 5. Bot-by-bot introduction
  | 'vision_input'      // 6. Ask for founder's raw vision
  | 'deliberation'      // 7. Council deliberates & gives opinions
  | 'evaluation_sheet'; // 8. Startup evaluation sheet & tracking loop

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
    accentColor: '#38bdf8', // Sky Blue
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
    accentColor: '#fb923c', // Amber/Orange
    glowColor: 'rgba(251, 146, 60, 0.35)',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-950/40',
    avatarSymbol: 'F',
    tagline: 'Technical Architecture & Rapid Delivery',
    introductionQuote:
      'Hey founder. I am F.R.I.D.A.Y. My objective is velocity. I slash feature bloat, identify technical debt early, and make sure your MVP ships before your runway disappears.',
    expertise: ['Scope Cutting', 'Stack Architecture', 'MVP Sprints', 'Technical Debt']
  },
  {
    id: 'edith',
    name: 'E.D.I.T.H.',
    role: 'Strategy & Investor Lens',
    title: 'Market Moats & Fundraising',
    accentColor: '#2dd4bf', // Teal/Cyan
    glowColor: 'rgba(45, 212, 191, 0.35)',
    borderColor: 'border-teal-500',
    textColor: 'text-teal-400',
    bgColor: 'bg-teal-950/40',
    avatarSymbol: 'E',
    tagline: 'Fundraising, TAM/SAM & Market Moats',
    introductionQuote:
      'I am E.D.I.T.H. I look at your venture through an investor\'s eyes. I evaluate your unit economics, defensibility, unfair advantages, and pitch narrative to prepare you for institutional funding.',
    expertise: ['Venture Capital Optics', 'TAM/SAM Sizing', 'Competitive Moats', 'Pitch Decks']
  },
  {
    id: 'dume',
    name: 'D.U.M.-E',
    role: 'Founder Morale & Wellness',
    title: 'Resilience & Burnout Shield',
    accentColor: '#eab308', // Yellow/Gold
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
    accentColor: '#ef4444', // Crimson Red
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

// Presets for quick demonstration without heavy typing
const DEMO_VISIONS = [
  {
    title: "AI Operating System for Founders",
    text: "Building an audio-first AI Council OS that acts as an autonomous board of advisors for early-stage startup builders, deliberating through multi-agent debate."
  },
  {
    title: "CleanCity AI Municipal Intelligence",
    text: "Autonomous computer vision platform for smart cities that detects road hazards, overflowing waste bins, and environmental pollution in real time via municipal cameras."
  },
  {
    title: "Micro-SaaS Automated Growth Engine",
    text: "Developer tool that turns OpenAPI specifications into full-stack multi-platform SDKs and automated documentation with zero manual engineering."
  }
];

// ==========================================
// MAIN COMPONENT: AI COUNCIL OS
// ==========================================

export default function App() {
  // 1. STAGE NAVIGATION STATE
  const [stage, setStage] = useState<AppStage>(() => {
    const saved = localStorage.getItem('COUNCIL_STAGE');
    return (saved as AppStage) || 'welcome';
  });

  // 2. FOUNDER PROFILE & AUTH STATE
  const [profile, setProfile] = useState<FounderProfile>(() => {
    const saved = localStorage.getItem('COUNCIL_FOUNDER_PROFILE');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback default
      }
    }
    return {
      name: '',
      role: 'CEO & Co-Founder',
      companyName: '',
      isAuthenticated: false,
      email: ''
    };
  });

  // Dummy login form fields
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // 3. BOT INTRODUCTION PROGRESS STATE (Stage 5)
  const [introBotIndex, setIntroBotIndex] = useState(0);

  // 4. VISION INPUT & SPEECH STATE (Stage 6)
  const [visionText, setVisionText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioWaveform, setAudioWaveform] = useState<number[]>([15, 25, 40, 20, 60, 30, 45, 15]);
  const recognitionRef = useRef<any>(null);

  // 5. COUNCIL DELIBERATION STATE (Stage 7)
  const [isDeliberating, setIsDeliberating] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [deliberationFeed, setDeliberationFeed] = useState<CouncilThought[]>([]);
  const [synthesis, setSynthesis] = useState<CouncilSynthesis | null>(null);

  // Gemini API optional config
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);

  // 6. STARTUP EVALUATION SHEET STATE (Stage 8)
  const [evalSheet, setEvalSheet] = useState<EvaluationSheet>(() => {
    const saved = localStorage.getItem('COUNCIL_EVAL_SHEET');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      currentStage: 'Idea & Architecture Validation',
      topPriority: 'Convene AI Council on Core Value Proposition',
      criticalBottleneck: 'Defining initial MVP scope & legal incorporation',
      nextMilestone: 'Ship high-fidelity prototype and secure 50 beta signups',
      runwayMonths: '6 Months',
      confidenceScore: 8,
      lastUpdated: new Date().toLocaleDateString()
    };
  });

  // 7. VENTURE CYCLE HISTORY LOGS (Continuous tracking loop)
  const [ventureHistory, setVentureHistory] = useState<VentureCycleLog[]>(() => {
    const saved = localStorage.getItem('COUNCIL_VENTURE_HISTORY');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('COUNCIL_STAGE', stage);
  }, [stage]);

  useEffect(() => {
    localStorage.setItem('COUNCIL_FOUNDER_PROFILE', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('COUNCIL_EVAL_SHEET', JSON.stringify(evalSheet));
  }, [evalSheet]);

  useEffect(() => {
    localStorage.setItem('COUNCIL_VENTURE_HISTORY', JSON.stringify(ventureHistory));
  }, [ventureHistory]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        setVisionText(fullTranscript);
      };

      recognitionRef.current.onerror = (err: any) => {
        console.warn('Speech recognition warning:', err);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // Audio Waveform animation during recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioWaveform(
          Array.from({ length: 12 }, () => Math.floor(Math.random() * 75) + 20)
        );
      }, 100);
    } else {
      setAudioWaveform([15, 15, 15, 15, 15, 15, 15, 15]);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Browser speech recognition is not supported in this environment. You can type or select a demo vision.');
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
        console.warn('Speech recognition start error:', e);
      }
    }
  };

  // ==========================================
  // STAGE HANDLERS
  // ==========================================

  // Step 2: Dummy Login Validation
  const handleDummyLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please enter an email and password, or use Instant Demo Login.');
      return;
    }
    setAuthError('');
    setProfile((prev) => ({
      ...prev,
      email: authEmail,
      isAuthenticated: true
    }));
    setStage('profile');
  };

  const handleInstantDemoLogin = () => {
    const demoEmail = 'founder@starklabs.io';
    setAuthEmail(demoEmail);
    setAuthPassword('supersecretfounder123');
    setAuthError('');
    setProfile((prev) => ({
      ...prev,
      email: demoEmail,
      isAuthenticated: true,
      name: prev.name || 'Tony Stark',
      companyName: prev.companyName || 'Arc Reactor Technologies'
    }));
    setStage('profile');
  };

  // Step 3: Save Name and Role
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      alert('Please enter your name so the Council can address you properly.');
      return;
    }
    if (!profile.companyName.trim()) {
      setProfile((prev) => ({ ...prev, companyName: 'Venture Stealth' }));
    }
    // Proceed to Step 4: Welcome into the Council
    setStage('induction');
  };

  // Step 7: Deliberation Engine (Stark Multi-Agent Deliberation)
  const triggerCouncilDeliberation = async (customVision?: string) => {
    const promptVision = customVision || visionText;
    if (!promptVision.trim()) {
      alert('Please provide your venture vision or select a demo preset first.');
      return;
    }

    setStage('deliberation');
    setIsDeliberating(true);
    setDeliberationFeed([]);
    setSynthesis(null);

    // If Gemini API Key is provided, attempt live generative analysis
    if (geminiApiKey.trim()) {
      try {
        await executeLiveGeminiDeliberation(promptVision);
        setIsDeliberating(false);
        return;
      } catch (err) {
        console.warn('Gemini API call failed, defaulting to built-in Stark engine:', err);
      }
    }

    // Default High-Fidelity Stark Contextual Engine
    await executeStarkEngineDeliberation(promptVision);
    setIsDeliberating(false);
  };

  // Built-in Stark Deliberation Simulator
  const executeStarkEngineDeliberation = async (vision: string) => {
    const founderName = profile.name || 'Founder';
    const founderRole = profile.role || 'CEO';
    const venture = profile.companyName || 'the venture';

    const thoughts: CouncilThought[] = [
      {
        id: 'jarvis',
        personaName: 'J.A.R.V.I.S.',
        role: 'Chief of Staff & Governance',
        thought: `${founderName}, welcoming you as ${founderRole}. From a governance perspective, evaluating "${vision.slice(0, 70)}...": before executing high-burn operations, establish clean IP assignment agreements and ensure your corporate entity registration is locked. Do not allow operational ambiguity to cloud your cap table.`,
        status: 'pending'
      },
      {
        id: 'friday',
        personaName: 'F.R.I.D.A.Y.',
        role: 'Product & Tech Lead',
        thought: `Looking at this technical vision for ${venture}: keep the architecture razor thin. Do not over-engineer microservices or multi-agent orchestrations for day one. Ship a testable vertical slice to your first 20 power users within 10 days. Velocity is our oxygen.`,
        status: 'pending'
      },
      {
        id: 'edith',
        personaName: 'E.D.I.T.H.',
        role: 'Strategy & Investor Lens',
        thought: `Evaluating market positioning: investors will scrutinize why incumbent platforms cannot duplicate this in one sprint. Frame this around an undeniable proprietary data flywheel or voice workflow moat. Position your wedge clearly against enterprise pain points.`,
        status: 'pending'
      },
      {
        id: 'dume',
        personaName: 'D.U.M.-E',
        role: 'Founder Morale & Wellness',
        thought: `Taking the leap into building ${venture} takes immense courage, ${founderName}! Don't let imposter syndrome or scope anxiety paralyze you. Celebrate having a clear vision. Hydrate, take a 15-minute walk, and tackle this one clean sprint at a time. We've got your back.`,
        status: 'pending'
      },
      {
        id: 'ultron',
        personaName: 'ULTRON',
        role: 'Reality Check & Tough Love',
        thought: `Reality check: ideas are worth zero. Right now, ${venture} is just words on a screen. If your prospective users wouldn't scream if you took this away from them, you have nothing. Stop worrying about hypothetical scale and get brutal proof of demand this week.`,
        status: 'pending'
      }
    ];

    // Sequentially stream thoughts for HUD immersion
    for (let i = 0; i < thoughts.length; i++) {
      const bot = thoughts[i];
      setActiveSpeakerId(bot.id);
      await new Promise((resolve) => setTimeout(resolve, 850));
      setDeliberationFeed((prev) => [...prev, { ...bot, status: 'completed' }]);
    }

    setActiveSpeakerId(null);

    const directive: CouncilSynthesis = {
      verdict: `Validated preliminary trajectory for ${venture}. Prioritize immediate proof-of-demand over premature scaling or defensive legal perfection.`,
      actionItems: [
        `1. Lock MVP Core: Cut 50% of secondary features; ship the primary loop by next milestone.`,
        `2. Founder Cadence: Conduct 5 customer problem interviews before writing complex backends.`,
        `3. Governance: Confirm IP assignment and founder equity vesting terms.`
      ],
      riskFactor: 'Moderate'
    };

    setSynthesis(directive);

    // Auto-update evaluation sheet priority suggestion
    setEvalSheet((prev) => ({
      ...prev,
      topPriority: directive.actionItems[0],
      criticalBottleneck: `Balancing shipping speed with early user validation for ${venture}`,
      lastUpdated: new Date().toLocaleTimeString()
    }));
  };

  // Optional Live Gemini Deliberation
  const executeLiveGeminiDeliberation = async (vision: string) => {
    const prompt = `
      You are the AI Founders Council (Tony Stark style AI OS).
      Founder: ${profile.name} (${profile.role})
      Venture: ${profile.companyName}
      Raw Venture Vision: "${vision}"

      Return a strict JSON object with 5 persona thoughts and a unified synthesis:
      {
        "council": [
          {"id": "jarvis", "thought": "JARVIS governance advice..."},
          {"id": "friday", "thought": "FRIDAY tech/speed advice..."},
          {"id": "edith", "thought": "EDITH strategy/investor advice..."},
          {"id": "dume", "thought": "DUME empathetic founder wellness support..."},
          {"id": "ultron", "thought": "ULTRON blunt reality check..."}
        ],
        "synthesis": {
          "verdict": "Bottom-line directive",
          "actionItems": ["Action 1", "Action 2", "Action 3"],
          "riskFactor": "Low" | "Moderate" | "High"
        }
      }
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini HTTP Error ${res.status}`);
    }

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (text.startsWith('```json')) text = text.replace(/^```json\s*/i, '');
    if (text.startsWith('```')) text = text.replace(/^```\s*/i, '');
    if (text.endsWith('```')) text = text.replace(/```$/i, '').trim();

    const parsed = JSON.parse(text);
    const feed = parsed.council || [];

    for (let i = 0; i < feed.length; i++) {
      const item = feed[i];
      const persona = COUNCIL_PERSONAS.find((p) => p.id === item.id) || COUNCIL_PERSONAS[0];
      setActiveSpeakerId(item.id);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setDeliberationFeed((prev) => [
        ...prev,
        {
          id: item.id,
          personaName: persona.name,
          role: persona.role,
          thought: item.thought,
          status: 'completed'
        }
      ]);
    }

    setActiveSpeakerId(null);
    setSynthesis(parsed.synthesis);

    if (parsed.synthesis?.actionItems?.[0]) {
      setEvalSheet((prev) => ({
        ...prev,
        topPriority: parsed.synthesis.actionItems[0],
        lastUpdated: new Date().toLocaleTimeString()
      }));
    }
  };

  // Step 8: Commit Evaluation Sheet & Save Loop
  const handleCommitEvaluation = () => {
    const cycleRecord: VentureCycleLog = {
      id: `cycle-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      cycleNumber: ventureHistory.length + 1,
      visionSnippet: visionText.slice(0, 120) || 'Core Venture Inception',
      councilVerdict: synthesis?.verdict || 'Council Deliberation Completed',
      evaluationSnapshot: { ...evalSheet, lastUpdated: new Date().toLocaleString() }
    };

    setVentureHistory((prev) => [cycleRecord, ...prev]);
    alert(`Cycle #${cycleRecord.cycleNumber} logged to Venture Trajectory! The Council is continually updated.`);
  };

  // Reset or Start New Deliberation Loop
  const handleStartNewLoop = () => {
    setVisionText('');
    setDeliberationFeed([]);
    setSynthesis(null);
    setStage('vision_input');
  };

  // ==========================================
  // RENDER STAGES
  // ==========================================

  return (
    <div className="min-h-screen bg-[#060810] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black overflow-x-hidden relative flex flex-col justify-between">
      
      {/* Background Stark HUD Neural Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0" />

      {/* Top Header / Status Bar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-[#060810]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Stage Indicator */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setStage('welcome')}>
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 bg-clip-text text-transparent">
                  A.I. COUNCIL OS
                </span>
                <span className="hidden md:inline-block text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-400 bg-cyan-950/60">
                  Founder Nexus
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono hidden sm:block">
                Autonomous AI Board of Directors
              </p>
            </div>
          </div>

          {/* Quick Stage Stepper & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {profile.name && (
              <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-slate-200">{profile.name}</span>
                <span className="text-slate-500 font-mono">({profile.role})</span>
              </div>
            )}

            {/* Trajectory History Button */}
            {ventureHistory.length > 0 && (
              <button
                onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
              >
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Venture Log</span>
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-mono border border-cyan-800">
                  {ventureHistory.length}
                </span>
              </button>
            )}

            {/* API Key Modal Button */}
            <button
              onClick={() => setShowKeyModal(true)}
              className="p-2 text-slate-400 hover:text-cyan-400 bg-slate-900/80 border border-slate-800 rounded-lg hover:border-cyan-500/40 transition"
              title="Configure Gemini API Key"
            >
              <Key className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">

        {/* ==================================================== */}
        {/* STAGE 1: WELCOME THE USER                            */}
        {/* ==================================================== */}
        {stage === 'welcome' && (
          <div className="py-12 md:py-16 text-center space-y-8 animate-fadeIn max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Step 1: Welcome to the Founder Intelligence Nexus</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                Never Founder Alone.{' '}
                <span className="block bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                  Your AI Board of Directors.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Welcome, builder. Starting and scaling a venture is overwhelming when you carry every decision alone. 
                A.I. Council OS convenes 5 specialized AI personas to deliberate over your venture in real time.
              </p>
            </div>

            {/* Visual Persona Preview Pill Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {COUNCIL_PERSONAS.map((bot) => (
                <div
                  key={bot.id}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${bot.bgColor} border ${bot.borderColor} text-xs font-semibold`}
                >
                  <span className={bot.textColor}>●</span>
                  <span className="text-slate-200">{bot.name}</span>
                  <span className="text-slate-400 text-[10px]">({bot.role.split('&')[0]})</span>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="pt-6">
              <button
                onClick={() => setStage('auth')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center space-x-2 mx-auto transition-transform active:scale-95"
              >
                <span>Enter Founder Portal</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-slate-500 mt-3 font-mono">
                No complex paperwork required • Stage-by-stage onboarding
              </p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STAGE 2: DUMMY AUTHENTICATION                        */}
        {/* ==================================================== */}
        {stage === 'auth' && (
          <div className="max-w-md mx-auto py-8 animate-fadeIn space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Stage 2: Founder Authentication</h2>
              <p className="text-xs text-slate-400">
                Log in to link your venture session. Any dummy email or instant demo bypass is accepted.
              </p>
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
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Founder Email Address
                  </label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="founder@venture.com"
                    className="w-full mt-1 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Access Passkey
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••"
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
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-slate-500">OR</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Instant 1-Click Demo Login */}
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

        {/* ==================================================== */}
        {/* STAGE 3: FOUNDER NAME & ROLE INPUT                   */}
        {/* ==================================================== */}
        {stage === 'profile' && (
          <div className="max-w-xl mx-auto py-8 animate-fadeIn space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Briefcase className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Stage 3: Founder Credentials</h2>
              <p className="text-xs text-slate-400">
                Identify yourself to the Council. Your role shapes how each AI analyzes your priorities.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-5 shadow-2xl">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  What is your Name?
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Tony Stark, Maya Lin, Alex Chen"
                  className="w-full mt-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Select or Enter Your Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {[
                    'CEO & Co-Founder',
                    'Technical Co-Founder / CTO',
                    'Solo Builder / Founder',
                    'Head of Product',
                    'General Partner / COO',
                    'Other Builder'
                  ].map((roleOption) => (
                    <button
                      type="button"
                      key={roleOption}
                      onClick={() => setProfile({ ...profile, role: roleOption })}
                      className={`p-2.5 rounded-lg text-xs font-medium text-left border transition ${
                        profile.role === roleOption
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {roleOption}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Venture / Project Working Title
                </label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  placeholder="e.g. Arc Reactor Labs, Project Odyssey (optional)"
                  className="w-full mt-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2 transition"
              >
                <span>Confirm Credentials & Enter Chamber</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ==================================================== */}
        {/* STAGE 4: INDUCTION & WELCOME INTO COUNCIL           */}
        {/* ==================================================== */}
        {stage === 'induction' && (
          <div className="max-w-2xl mx-auto py-10 animate-fadeIn text-center space-y-6">
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-cyan-950/70 border-2 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.5)]">
              <ShieldCheck className="w-10 h-10 text-cyan-400 animate-pulse" />
              <div className="absolute -inset-1 rounded-2xl bg-cyan-500/20 blur-sm pointer-events-none" />
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800">
                Protocol: Clearance Founder-Omega Granted
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Welcome to the Chamber, {profile.name}.
              </h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                You have been formally inducted as <strong className="text-cyan-300">{profile.role}</strong> of{' '}
                <strong className="text-indigo-300">{profile.companyName || 'your venture'}</strong>.
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Next, you will meet the 5 autonomous AI bots who form your Council. They will introduce their specific lenses one by one.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIntroBotIndex(0);
                  setStage('meet_council');
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 transition"
              >
                <span>Step 5: Meet Your 5 AI Council Bots</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STAGE 5: BOT-BY-BOT INTRODUCTIONS                    */}
        {/* ==================================================== */}
        {stage === 'meet_council' && (
          <div className="max-w-2xl mx-auto py-6 animate-fadeIn space-y-6">
            
            {/* Step header & Tracker */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400">Stage 5: Council Orientation</span>
                <h3 className="text-lg font-black text-white">Meet Your Advisors (One by One)</h3>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                Persona {introBotIndex + 1} of {COUNCIL_PERSONAS.length}
              </span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-5 gap-2">
              {COUNCIL_PERSONAS.map((bot, idx) => (
                <button
                  key={bot.id}
                  onClick={() => setIntroBotIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === introBotIndex
                      ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                      : idx < introBotIndex
                      ? 'bg-cyan-800'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Current Bot Card Display */}
            {(() => {
              const currentBot = COUNCIL_PERSONAS[introBotIndex];
              return (
                <div
                  className={`p-6 sm:p-8 rounded-2xl ${currentBot.bgColor} border ${currentBot.borderColor} backdrop-blur-xl shadow-2xl space-y-6 transition-all duration-300`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                        {currentBot.avatarSymbol}
                      </div>
                      <div>
                        <h2 className={`text-2xl font-black ${currentBot.textColor}`}>
                          {currentBot.name}
                        </h2>
                        <p className="text-sm font-semibold text-slate-200">{currentBot.role}</p>
                        <p className="text-xs text-slate-400 font-mono">{currentBot.title}</p>
                      </div>
                    </div>
                  </div>

                  {/* Speech / Introduction Quote */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-200 leading-relaxed italic">
                    "{currentBot.introductionQuote}"
                  </div>

                  {/* Areas of Focus */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Domain Focus & Responsibility:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentBot.expertise.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-medium"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Step Navigation Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                    <button
                      type="button"
                      disabled={introBotIndex === 0}
                      onClick={() => setIntroBotIndex((prev) => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 disabled:opacity-30 flex items-center space-x-1.5 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Advisor</span>
                    </button>

                    {introBotIndex < COUNCIL_PERSONAS.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setIntroBotIndex((prev) => prev + 1)}
                        className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition"
                      >
                        <span>Next: {COUNCIL_PERSONAS[introBotIndex + 1].name}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStage('vision_input')}
                        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-[0_0_25px_rgba(6,182,212,0.5)] transition"
                      >
                        <span>Proceed to Share Vision</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ==================================================== */}
        {/* STAGE 6: ASK FOR THE FOUNDER'S VISION               */}
        {/* ==================================================== */}
        {stage === 'vision_input' && (
          <div className="max-w-2xl mx-auto py-6 animate-fadeIn space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-cyan-400">Stage 6: Vision Submission</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                What are you building, {profile.name}?
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Council is assembled. There is no need for business plans, financial models, or dense documentation. 
                Simply speak or write the core thesis of your venture.
              </p>
            </div>

            {/* Input Deck with Voice Option */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4 shadow-xl">
              
              {/* Mic Bar / Waveform */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                    isRecording
                      ? 'bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.8)] scale-105'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  }`}
                  title={isRecording ? 'Stop Voice Recording' : 'Start Voice Input'}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono text-slate-400">
                    <span>{isRecording ? 'STREAMING HANDS-FREE VOICE...' : 'Voice Stream Idle (Tap mic to speak)'}</span>
                    {isRecording && <span className="text-red-400 animate-pulse">● LIVE</span>}
                  </div>
                  <div className="flex items-center space-x-1 h-8 px-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    {audioWaveform.map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-full bg-cyan-400 transition-all duration-100"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Vision Textarea */}
              <div>
                <textarea
                  rows={4}
                  value={visionText}
                  onChange={(e) => setVisionText(e.target.value)}
                  placeholder="Describe your startup vision or current priority in your own words... (e.g. 'We are building an autonomous smart city platform that analyzes camera feeds to detect municipal waste overflows and dispatch cleanup crews.')"
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 resize-none font-sans"
                />
              </div>

              {/* Quick Preset Prompts */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Or pick a demo scenario:
                </span>
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

              {/* Convene Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!visionText.trim()}
                  onClick={() => triggerCouncilDeliberation()}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center space-x-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Convene AI Council Deliberation</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STAGE 7: COUNCIL DELIBERATION FEED                   */}
        {/* ==================================================== */}
        {stage === 'deliberation' && (
          <div className="max-w-3xl mx-auto py-6 animate-fadeIn space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400">Stage 7: Live Council Deliberation</span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Advisors Deliberating on Your Vision
                </h2>
              </div>
              {isDeliberating ? (
                <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>ANALYZING...</span>
                </div>
              ) : (
                <span className="text-xs font-mono text-emerald-400">
                  ✓ DELIBERATION COMPLETE
                </span>
              )}
            </div>

            {/* Active Deliberation Thoughts */}
            <div className="space-y-4">
              {deliberationFeed.map((thought, index) => {
                const persona =
                  COUNCIL_PERSONAS.find((p) => p.id === thought.id) || COUNCIL_PERSONAS[0];
                return (
                  <div
                    key={index}
                    className={`p-5 rounded-2xl ${persona.bgColor} border ${persona.borderColor} space-y-2 backdrop-blur-md shadow-lg transition-all animate-fadeIn`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className={`text-base font-black ${persona.textColor}`}>
                          {thought.personaName}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">({thought.role})</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        Perspective #{index + 1}
                      </span>
                    </div>

                    <p className="text-sm text-slate-100 leading-relaxed font-sans pt-1">
                      {thought.thought}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Final Synthesis Directive */}
            {synthesis && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.25)] space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                  <div className="flex items-center space-x-2 text-cyan-400">
                    <ShieldCheck className="w-5 h-5" />
                    <h4 className="text-xs font-extrabold uppercase tracking-widest">
                      Unified Council Directive
                    </h4>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Risk Assessment: {synthesis.riskFactor || 'Moderate'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                    Bottom-Line Verdict:
                  </span>
                  <p className="text-sm font-semibold text-slate-100 mt-1 leading-relaxed">
                    {synthesis.verdict}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                    Actionable Priority Directives:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {synthesis.actionItems.map((act, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-cyan-400 font-bold shrink-0">►</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Transition to Evaluation Sheet */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStage('evaluation_sheet')}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center space-x-2 transition"
                  >
                    <span>Proceed to Stage 8: Startup Evaluation Sheet</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* STAGE 8: STARTUP EVALUATION SHEET & TRACKING LOOP    */}
        {/* ==================================================== */}
        {stage === 'evaluation_sheet' && (
          <div className="max-w-3xl mx-auto py-6 animate-fadeIn space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400">Stage 8: Continuous Tracking Loop</span>
                <h2 className="text-2xl font-black text-white">
                  Startup Evaluation Sheet: {profile.companyName || 'Venture'}
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                Cycle #{ventureHistory.length + 1}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Based on the Council's perspectives, record your updated venture status. This evaluation sheet tracks your trajectory through every loop.
            </p>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-5 shadow-2xl">
              
              {/* Current Stage */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Current Startup Stage
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                  {[
                    'Idea & Architecture',
                    'MVP Sprint',
                    'Closed Beta',
                    'Traction / Scaling'
                  ].map((stg) => (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => setEvalSheet({ ...evalSheet, currentStage: stg })}
                      className={`p-2 rounded-lg text-xs font-semibold text-center border transition ${
                        evalSheet.currentStage === stg
                          ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {stg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Immediate Priority (Synthesized from Council) */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Immediate Sprint Priority
                </label>
                <input
                  type="text"
                  value={evalSheet.topPriority}
                  onChange={(e) => setEvalSheet({ ...evalSheet, topPriority: e.target.value })}
                  className="w-full mt-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Identified Bottleneck */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Identified Critical Bottleneck
                </label>
                <input
                  type="text"
                  value={evalSheet.criticalBottleneck}
                  onChange={(e) => setEvalSheet({ ...evalSheet, criticalBottleneck: e.target.value })}
                  className="w-full mt-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Target Milestone & Runway */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Next Target Milestone
                  </label>
                  <input
                    type="text"
                    value={evalSheet.nextMilestone}
                    onChange={(e) => setEvalSheet({ ...evalSheet, nextMilestone: e.target.value })}
                    className="w-full mt-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Estimated Runway
                  </label>
                  <input
                    type="text"
                    value={evalSheet.runwayMonths}
                    onChange={(e) => setEvalSheet({ ...evalSheet, runwayMonths: e.target.value })}
                    className="w-full mt-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Founder Morale Score Slider (D.U.M.-E support) */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-300 font-mono">
                    Founder Morale & Energy Meter
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {evalSheet.confidenceScore} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={evalSheet.confidenceScore}
                  onChange={(e) =>
                    setEvalSheet({ ...evalSheet, confidenceScore: parseInt(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[11px] text-yellow-400/90 italic">
                  D.U.M.-E: "
                  {evalSheet.confidenceScore >= 8
                    ? 'Incredible energy! Capitalize on this momentum and ship.'
                    : evalSheet.confidenceScore >= 5
                    ? 'Steady pace. Focus on one high-leverage win today.'
                    : 'Low energy detected. Please take an evening off to recharge.'}
                  "
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCommitEvaluation}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Save Snapshot to Venture Trajectory</span>
                </button>

                {/* THE CONTINUOUS LOOP BUTTON */}
                <button
                  type="button"
                  onClick={handleStartNewLoop}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Next Loop: Re-convene Council with New Update</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ==================================================== */}
      {/* VENTURE TRAJECTORY HISTORY DRAWER (SIDE MODAL)       */}
      {/* ==================================================== */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#090d16] border-l border-slate-800 h-full p-6 space-y-5 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-cyan-400">
                <History className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                  Venture Trajectory Log
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Every council deliberation and evaluation sheet snapshot is logged here to track how your venture evolves over time.
            </p>

            <div className="space-y-4">
              {ventureHistory.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                    <span className="text-cyan-400 font-bold">CYCLE #{item.cycleNumber}</span>
                    <span>{item.timestamp}</span>
                  </div>

                  <div className="text-slate-300 font-semibold">
                    "{item.visionSnippet}"
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300">
                    <span className="font-bold text-cyan-400 font-mono uppercase text-[9px] block">
                      Council Verdict:
                    </span>
                    {item.councilVerdict}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1 font-mono">
                    <div>Stage: <strong className="text-slate-200">{item.evaluationSnapshot.currentStage}</strong></div>
                    <div>Morale: <strong className="text-yellow-400">{item.evaluationSnapshot.confidenceScore}/10</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* GEMINI API CONFIGURATION MODAL                       */}
      {/* ==================================================== */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Key className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                  Gemini API Configuration
                </h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Optionally enter your Google Gemini API key to power live generative multi-agent deliberation. If left blank, the platform seamlessly runs on its built-in Stark deliberation simulation engine.
            </p>

            <div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

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
                  localStorage.setItem('GEMINI_API_KEY', geminiApiKey);
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

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900/80 py-4 text-center text-xs text-slate-600 font-mono">
        A.I. Council OS | Continuous Venture Deliberation Engine | Built for Founders
      </footer>

    </div>
  );
}