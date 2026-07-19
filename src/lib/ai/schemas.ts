import { z } from 'zod';

// Client request schema for Copilot Chat
export const CopilotRequestSchema = z.object({
  message: z.string().min(1).max(500),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string()
  })).max(10), // Limit history size
  language: z.enum(['en', 'hi', 'hinglish', 'es']),
  userRole: z.enum(['fan', 'operator', 'volunteer']),
  stadiumState: z.object({
    zones: z.array(z.any()),
    pois: z.array(z.any()),
    incidents: z.array(z.any())
  })
});

// Zod schema for structured Gemini Output
export const CopilotResponseSchema = z.object({
  reply: z.string(),
  suggestedFollowups: z.array(z.string()).max(3),
  detectedIntent: z.string()
});

// Client request schema for Route Explanation
export const RouteExplainRequestSchema = z.object({
  startPoiId: z.string().min(1),
  endPoiId: z.string().min(1),
  routeResult: z.object({
    path: z.array(z.string()),
    totalDistance: z.number(),
    etaMinutes: z.number(),
    isAccessible: z.boolean(),
    costExplain: z.object({
      baseDistance: z.number(),
      congestionPenalty: z.number(),
      accessibilityFilter: z.boolean()
    })
  }),
  requireAccessible: z.boolean(),
  avoidCongested: z.boolean()
});

// Zod schema for structured Route Explanation Output
export const RouteExplainResponseSchema = z.object({
  explanation: z.string()
});
