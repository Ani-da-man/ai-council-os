# A.I. Council OS — Founder Intelligence Nexus

> **Never Founder Alone.** An autonomous AI Board of Directors deliberating on your venture in real time.

Built for founders, innovators, and builders to eliminate decision paralysis through structured, stage-by-stage multi-agent deliberation.

---

## ⚡ 8-Stage Founder Journey

1. **Welcome Screen** — Cinematic Stark-inspired HUD introduction.
2. **Dummy Authentication** — Frictionless demo login or instant 1-click bypass.
3. **Founder Profile** — Personal identity and role assignment (CEO, CTO, Solo Builder, etc.).
4. **Council Induction** — Clearance Level: Founder-Omega ceremony.
5. **Meet the Council** — Individual, interactive step-by-step introduction to each AI persona:
   - **J.A.R.V.I.S.** — Chief of Staff & Governance (Legal, entity formation, execution timelines)
   - **F.R.I.D.A.Y.** — Product & Tech Lead (Scope cutting, architecture, shipping velocity)
   - **E.D.I.T.H.** — Strategy & Investor Lens (Moats, TAM/SAM, pitch decks, investor optics)
   - **D.U.M.-E** — Founder Morale & Wellness (Burnout shield, celebration of wins, resilience)
   - **ULTRON** — Reality Check & Tough Love (Vanity metric destruction, brutal market truths)
6. **Vision Submission** — Quick thesis prompt without tedious business plans (features hands-free Wispr voice recording).
7. **Multi-Agent Deliberation** — Live sequential deliberation feed and unified Council Directive.
8. **Startup Evaluation Sheet & Tracking Loop** — Dynamic venture scorecard with a continuous cycle log that records every milestone over time.

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev

# 3. Build for production
npm run build
```

---

## 🌐 Deploy to Render (Blueprint Deployment)

This repository includes a pre-configured `render.yaml` Blueprint spec for one-click deployment on [Render](https://render.com):

1. Push this repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/ai-council-os.git
   git branch -M main
   git push -u origin main
   ```
2. In your Render Dashboard, click **New +** > **Blueprint**.
3. Connect your new `ai-council-os` repository.
4. Render will automatically detect `render.yaml`, build the static site via `npm run build`, and host it with full client-side routing rewrites.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite 6
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Voice Engine**: Web Speech API with live audio waveform simulation
- **Generative AI**: Built-in Stark Multi-Agent Contextual Engine + optional Google Gemini 2.0 API integration
