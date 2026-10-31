# Venture Vision

Venture Vision is a companion for the long journey of building a venture. It helps founders navigate entrepreneurship, choose their next steps, track progress, and find support as their goals and circumstances change.

The app brings together a five-person AI council, one-on-one advisor conversations, a venture roadmap, and a living evaluation sheet. Guidance can take the founder's career path, available time, support and funding, venture stage, runway, priorities, and energy into account.

## Try the demo

There are two ways to explore the app. No real account is needed; the sign-in is a demo flow and accepts any email and password.

### Open the saved workspace snapshot

1. Open the app's welcome page.
2. Choose **Explore the startup workspace demo**.
3. Venture Vision opens a sample CleanCity AI startup with a populated overview, roadmap, council discussion, activity history, and advisor conversation.
4. Use the workspace tabs to browse the snapshot. You can update the sample founder journey and venture evaluation too.

This is the quickest option for a short review. It opens saved sample content, so you can see the main workspace without first running an AI evaluation.

### Walk through the founder flow

1. On the welcome page, choose **Enter Founder Chamber**.
2. Sign in with any email and password, or choose **Instant 1-Click Founder Demo Access**.
3. Enter a founder name, venture name, and role. Add your founder journey: career path, support or funding, and time available. These details can be changed later in the workspace.
4. Continue through the council introduction, then describe a venture idea on the vision screen. You can type your own idea or choose one of the example ideas. If voice input is available in your browser, you can use it too.
5. Choose **Convene the Council** to get perspectives from the five advisors. When cloud AI is unavailable or not configured, the app can use local Gemma when the browser supports WebGPU, then its built-in Stark fallback.
6. Fill in the Startup Evaluation Sheet: choose the current stage and update your priority, bottleneck, milestone, runway, and energy. Save the evaluation to open the venture workspace.
7. In the workspace, use **Overview** to see current standing, **Roadmap** to track stages, **AI Council** to convene again or choose an advisor, and **Talk to an Advisor** for a one-on-one conversation. Return as the venture changes and update the evaluation to keep the advice current.

## What is in the workspace?

- **Overview:** current venture stage, founder energy, runway, priorities, bottleneck, milestone, founder circumstances, and recent activity.
- **Roadmap:** a visual path from idea validation through MVP, closed beta, and traction or scaling.
- **AI Council:** bring all five advisor perspectives back to the current venture.
- **One-on-one advisor:** talk with a selected council member at any point.
- **Evaluation and history:** save a snapshot of the venture's current state and look back at earlier council cycles.

## Run locally

Requirements: Node.js 20 or later.

```bash
npm install
npm run dev
```

Vite prints a local URL, usually `http://localhost:5173`. To create a production build:

```bash
npm run build
```

## AI options

- **Use your own Gemini key:** open the app's **🔑 Configuration** settings, choose a Gemini cloud model (including the flagship option when available), paste your Google AI API key into **Gemini API Key**, then choose **Save Configuration**. The key is saved in that browser's local storage and used for Gemini cloud responses. The app currently supports Gemini keys; other providers' API keys are not interchangeable.
- **Gemma in the browser:** local inference uses WebGPU and may need to download model weights the first time. Device and browser support vary.
- **Stark fallback:** a built-in contextual advisor is available if live model calls cannot run.

The demo workspace snapshot does not need an API key. Live Gemini responses require your configured Gemini key; local Gemma can run without a key when the browser supports WebGPU. If neither is available, the built-in fallback is used.

## Deploy to Render

This repository includes a `render.yaml` Blueprint for the static web app.

1. Push the repository to GitHub.
2. In Render, choose **New +** → **Blueprint** and connect the repository.
3. Render reads `render.yaml`, builds with `npm install && npm run build`, and publishes `dist` with single-page app routing.
4. Add any required Gemini API key through the Render environment settings if you want cloud AI responses in the deployed app.

## Tech stack

- React 18, TypeScript, and Vite
- Tailwind CSS and Lucide React
- Gemini API for optional cloud inference
- WebLLM for in-browser Gemma inference
- Built-in Stark contextual fallback
