# AI Council OS — Complete Project Briefing & Continuity Record

## 1. Project Identity & Architecture
- **Repository**: [https://github.com/Aniru-da-man/ai-council-os](https://github.com/Aniru-da-man/ai-council-os)
- **Local Workspace**: C:\Users\npven\OneDrive\Desktop\ai-council-os
- **Hosting**: Render Blueprint ready via ender.yaml
- **Stack**: Vite + React 18 + TypeScript + Tailwind CSS + Lucide Icons + WebLLM (@mlc-ai/web-llm)

---

## 2. Chronological Milestones (From Concept to Production)

### Step 1: Concept & 8-Stage Progressive Onboarding
- Started from _i_council_os_founder_assistant.tsx concept.
- Built a progressive 8-stage founder journey to eliminate cognitive overload:
  1. **Welcome**: Sleek sci-fi introduction with Stark-inspired glassmorphism.
  2. **Auth**: Lightweight dummy login validating any email/password.
  3. **Profile**: Founder name, venture name, and role designation.
  4. **Induction**: Audio/visual council welcome ceremony.
  5. **Meet Advisors**: One-by-one interactive walkthrough of the 5 council bots.
  6. **Vision Input**: Voice recording simulation, custom vision prompt, and venture templates.
  7. **Council Deliberation**: Live animated advisor debate with real-time thought streams.
  8. **Evaluation Sheet**: Interactive startup health scorecard, actionable priorities, and persistent trajectory history.

### Step 2: Independent Repository & Render Blueprint
- Packaged the entire application into an independent, production-grade folder: C:\Users\npven\OneDrive\Desktop\ai-council-os.
- Added ender.yaml configuring automatic static site deployment with SPA routing rewrites.
- Initialized Git, linked remote https://github.com/Aniru-da-man/ai-council-os.git, and pushed directly to main.

### Step 3: Multi-Tier Resilient Intelligence Stack
- Integrated the user-provided Gemini API key securely.
- Developed a 3-tier cascade ensuring the council NEVER freezes:
  - **Tier 1 (Cloud API)**: Google Gemini Flagship API.
  - **Tier 2 (In-Browser SLM)**: Gemma 2 2B Instruct via WebLLM and WebGPU. 100% local, runs on client hardware with zero API keys or external servers.
  - **Tier 3 (Emergency Heuristics)**: Built-in Stark Engine persona rule-evaluator.

### Step 4: Flagship Reasoning Upgrade (Gemini 2.5 Pro & Custom Model Support)
- Upgraded default Tier 1 model from Flash to **Gemini 2.5 Pro** (gemini-2.5-pro) for deeper strategic critique, nuanced counter-arguments, and deep cognitive synthesis.
- Added interactive **Model Selector** in the 🔑 configuration modal:
  - Gemini 2.5 Pro (Flagship Reasoning — Default)
  - Gemini 1.5 Pro (Deep Context)
  - Gemini 2.5 Flash (Balanced)
  - Gemini 2.0 Flash (Fast)
  - Custom Model ID (Supports typing arbitrary models like gemini-3.1-pro or preview checkpoints).
- Added intelligent intra-tier fallback: if a custom model or 2.5 Pro hits a temporary quota or 404, it immediately attempts gemini-2.0-flash before stepping down to Gemma 2 2B.

### Step 5: Automatic Configuration & Privacy Security
- Enabled Vite environment variable injection: import.meta.env.VITE_GEMINI_API_KEY.
- Created local .env.local containing the founder API key:
  - Automatically loads the key and model when testing locally (
pm run dev).
  - .env.local is protected in .gitignore — 100% safe from public Git leaks.
- Verified production build compiles cleanly in under 5 seconds with zero errors.

---

## 3. How to Run & Verify Locally
`powershell
cd C:\Users\npven\OneDrive\Desktop\ai-council-os
npm run dev
`
Open http://localhost:5173. Key and Gemini 2.5 Pro are already configured.
