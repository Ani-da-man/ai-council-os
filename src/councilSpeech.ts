import type { CouncilLanguage } from './councilLanguages';

const profiles: Record<string, { voice: string; rate: number; pitch: number; style: string }> = {
  jarvis: { voice: 'Charon', rate: 0.94, pitch: 0.93, style: 'A composed chief of staff. Measured, precise and quietly reassuring, with short pauses before decisions.' },
  friday: { voice: 'Puck', rate: 1.06, pitch: 1.08, style: 'An energetic product teammate. Curious and upbeat, with crisp emphasis on the next experiment.' },
  edith: { voice: 'Autonoe', rate: 0.97, pitch: 1.04, style: 'A thoughtful strategist. Clear and confident, with natural pauses to distinguish evidence from guesses.' },
  dume: { voice: 'Achird', rate: 0.89, pitch: 1.02, style: 'A warm, patient mentor. Gentle and conversational, with a relaxed pace and room between ideas.' },
  ultron: { voice: 'Kore', rate: 0.91, pitch: 0.83, style: 'A stern but fair colleague. Firm, grounded and direct, with understated emphasis on risks. Keep the delivery humane.' },
  directive: { voice: 'Sulafat', rate: 0.95, pitch: 1, style: 'A calm facilitator with clear diction and a natural pause between action items.' }
};

export function getSpeechProfile(personaId: string) {
  return profiles[personaId] || profiles.directive;
}

export async function generateCouncilSpeech(text: string, language: CouncilLanguage, personaId: string, key: string, signal: AbortSignal) {
  try {
    return await requestCouncilSpeech('gemini-3.8-flash-tts', text, language, personaId, key, signal);
  } catch (error) {
    if (signal.aborted || (error instanceof SpeechRequestError && ![403, 404, 429, 500, 502, 503, 504].includes(error.status))) {
      throw error;
    }
    return requestCouncilSpeech('gemini-3.8-flash-lite-tts', text, language, personaId, key, signal);
  }
}

class SpeechRequestError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Speech request returned HTTP ${status}`);
    this.status = status;
  }
}

async function requestCouncilSpeech(model: string, text: string, language: CouncilLanguage, personaId: string, key: string, signal: AbortSignal) {
  const profile = getSpeechProfile(personaId);
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    signal,
    body: JSON.stringify({
      model,
      input: [{
        type: 'user_input',
        content: [{
          type: 'text',
          text,
          annotations: [{
            type: 'speech_metadata',
            style: `${profile.style} Speak naturally in ${language.name}. Use human cadence and preserve names and words from other languages as written.`
          }]
        }]
      }],
      response_format: { type: 'audio' },
      generation_config: { speech_config: [{ voice: profile.voice }] }
    })
  });
  if (!response.ok) throw new SpeechRequestError(response.status);
  const result = await response.json();
  const part = result.steps?.filter((step: { type: string }) => step.type === 'model_output')
    .flatMap((step: { content?: unknown[] }) => step.content || [])
    .find((item: { type: string; data?: string }) => item.type === 'audio' && item.data);
  if (!part?.data) throw new Error('Speech response had no audio');
  return new Blob([Uint8Array.from(atob(part.data), character => character.charCodeAt(0))], { type: 'audio/wav' });
}
