import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { CopilotResponseSchema, RouteExplainResponseSchema } from './schemas';
import { getDeterministicFallback } from './fallbacks';
import { Language, UserRole } from '@/context/StadiumContext';
import { Zone, POI, Incident, RouteResult } from '@/types';

const apiKey = process.env.GEMINI_API_KEY || '';

let genAIInstance: GoogleGenerativeAI | null = null;
let modelInstance: GenerativeModel | null = null;

// Initialize generative AI SDK safely using Singleton pattern
const getGenModel = () => {
  if (!apiKey) return null;
  if (!modelInstance) {
    genAIInstance = new GoogleGenerativeAI(apiKey);
    modelInstance = genAIInstance.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });
  }
  return modelInstance;
};

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

/**
 * Calls Gemini server-side to generate a grounded, structured chatbot response.
 */
export async function getAIEstimateReply(
  message: string,
  history: ChatMessage[],
  language: Language,
  role: UserRole,
  stadiumState: { zones: Zone[]; pois: POI[]; incidents: Incident[] }
) {
  const model = getGenModel();
  
  // Deterministic Fallback if key is missing
  if (!model) {
    return getDeterministicFallback(message, language, role, stadiumState);
  }

  // Build grounding context
  const stadiumContextString = JSON.stringify({
    zones: stadiumState.zones.map(z => ({
      id: z.id,
      name: z.name,
      capacity: z.capacity,
      currentOccupancy: z.currentOccupancy,
      occupancyPercentage: `${((z.currentOccupancy / z.capacity) * 100).toFixed(0)}%`,
      inflow: z.inflow,
      outflow: z.outflow
    })),
    pois: stadiumState.pois.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      zoneId: p.zoneId,
      isAccessible: p.isAccessible,
      isClosed: p.isClosed
    })),
    incidents: stadiumState.incidents.map(i => ({
      id: i.id,
      title: i.title,
      severity: i.severity,
      status: i.status,
      evidence: i.evidence
    }))
  });

  const languagePrompt = {
    en: 'Answer in professional English.',
    hi: 'Answer in simple, professional Hindi using the Devanagari script (e.g. "आप गेट ए से प्रवेश कर सकते हैं।"). Keep it friendly and clear.',
    hinglish: 'Answer in natural Hinglish (Hindi written in the Roman script). For example, write "Aap Gate A se jaa sakte hain" instead of "You can go through Gate A" or Devanagari script. Keep it friendly and natural.',
    es: 'Answer in fluent Spanish (Español).'
  }[language];

  const systemInstruction = `
    You are StadiumFlow AI, an assistant for the FIFA World Cup 2026.
    Your target user is a ${role.toUpperCase()}.
    
    You must answer the user query based ONLY on the provided stadium telemetry data below.
    If the question is not related to the stadium layout or data, politely decline to answer.
    Never invent crowd counts or gate conditions.
    
    Grounding Data:
    ${stadiumContextString}
    
    Constraints:
    1. ${languagePrompt}
    2. Do not hallucinate safety rules.
    3. Return a JSON object matching this schema:
    {
      "reply": "your text response...",
      "suggestedFollowups": ["max 3 quick followup question strings..."],
      "detectedIntent": "intent_key (e.g. crowd_lookup, medical_lookup, amenity_lookup, routing_help, greeting)"
    }
  `;

  try {
    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }]
      })),
      systemInstruction: systemInstruction
    });

    // Run with a 7-second timeout limit
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI Request timeout')), 7000)
    );

    const apiPromise = chat.sendMessage(message);
    const result = await Promise.race([apiPromise, timeoutPromise]) as { response: { text: () => string } };
    
    const rawText = result.response.text();
    const parsed = JSON.parse(rawText);
    
    // Schema validation
    return CopilotResponseSchema.parse(parsed);
  } catch {
    // Graceful fallback to deterministic engine
    return getDeterministicFallback(message, language, role, stadiumState);
  }
}

const explanationCache = new Map<string, { explanation: string; timestamp: number }>();

/**
 * Calls Gemini server-side to explain a calculated route path.
 */
export async function getAIRouteExplanation(
  startName: string,
  endName: string,
  routeResult: RouteResult,
  requireAccessible: boolean,
  avoidCongested: boolean,
  language: Language
) {
  const cacheKey = `${startName}_${endName}_${requireAccessible}_${avoidCongested}_${language}_${routeResult.totalDistance}_${routeResult.etaMinutes}`;
  const now = Date.now();
  const cached = explanationCache.get(cacheKey);
  
  if (cached && now - cached.timestamp < 300000) { // 5 minutes cache
    return { explanation: cached.explanation };
  }

  const model = getGenModel();
  
  const accessibleText = requireAccessible ? 'step-free and wheelchair friendly' : 'standard walking';
  const detourText = routeResult.costExplain.congestionPenalty > 0 
    ? 'detoured around congested zones for safety' 
    : 'shortest walking path';
    
  const fallbackExplanation = `Route Description: Path starts at ${startName} and navigates to ${endName}. It is configured as ${accessibleText} and is ${detourText}. Total distance: ${routeResult.totalDistance} meters. Estimated walking time: ${routeResult.etaMinutes} minutes.`;

  if (!model) {
    return { explanation: fallbackExplanation };
  }

  const languagePrompt = {
    en: 'Explain in clear English.',
    hi: 'Explain in simple Hindi using Devanagari script. E.g., "यह मार्ग व्हीलचेयर अनुकूल है और भीड़ से बचाता है।"',
    hinglish: 'Explain in natural, simple Hinglish (Hindi written in Roman/Latin script). E.g. "Yeh route step-free hai aur bheed se bachaata hai."',
    es: 'Explain in clear Spanish.'
  }[language];

  const prompt = `
    You are StadiumFlow AI. Explain why this route was calculated for a fan.
    
    Route details:
    - Origin: ${startName}
    - Destination: ${endName}
    - Distance: ${routeResult.totalDistance} meters
    - Duration: ${routeResult.etaMinutes} minutes
    - Accessibility: ${requireAccessible ? 'Requires step-free' : 'No requirements'}
    - Congestion Avoidance: ${avoidCongested ? 'Avoid heavy crowds' : 'No requirements'}
    - Path Steps (in order): ${routeResult.path.join(' -> ')}
    
    Routing context:
    - Base Distance: ${routeResult.costExplain.baseDistance}m
    - Congestion cost penalty applied: +${routeResult.costExplain.congestionPenalty}m
    
    Instructions:
    1. ${languagePrompt}
    2. Write a short, friendly explanation (max 3 sentences) explaining why this path was chosen (e.g. if it avoids stairs or redirects around bottlenecks).
    3. Return a JSON object matching this schema:
    {
      "explanation": "your text explanation..."
    }
  `;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI Request timeout')), 5000)
    );

    const apiPromise = model.generateContent(prompt);
    const result = await Promise.race([apiPromise, timeoutPromise]) as { response: { text: () => string } };
    
    const rawText = result.response.text();
    const parsed = JSON.parse(rawText);
    
    const validated = RouteExplainResponseSchema.parse(parsed);
    explanationCache.set(cacheKey, { explanation: validated.explanation, timestamp: now });
    return validated;
  } catch {
    return { explanation: fallbackExplanation };
  }
}
