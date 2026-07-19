import { NextRequest, NextResponse } from 'next/server';
import { RouteExplainRequestSchema } from '@/lib/ai/schemas';
import { getAIRouteExplanation } from '@/lib/ai/gemini';
import { INITIAL_POIS } from '@/data/stadium-graph';
import { rateLimit } from '@/lib/server/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Security check: Same-origin / trusted-origin validation to prevent CORS exploits
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host) {
      const originHost = new URL(origin).host;
      if (originHost !== host && !originHost.endsWith('.vercel.app')) {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED_ORIGIN', message: 'CORS policy: Request from unauthorized origin is blocked.' } },
          { status: 403 }
        );
      }
    }

    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.headers.get('x-real-ip') || '127.0.0.1');
    const rate = rateLimit(ip, 10, 60000);

    if (!rate.success) {
      return NextResponse.json(
        {
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: `Rate limit exceeded. Please try again in ${rate.resetSeconds} seconds.`
          }
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rate.resetSeconds)
          }
        }
      );
    }

    const body = await req.json();
    
    // Validate request body
    const result = RouteExplainRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid route parameters.',
            fields: result.error.format()
          }
        },
        { status: 400 }
      );
    }

    const { startPoiId, endPoiId, routeResult, requireAccessible, avoidCongested } = result.data;
    
    // We can resolve names server side
    const startName = INITIAL_POIS.find(p => p.id === startPoiId)?.name || 'Starting Point';
    const endName = INITIAL_POIS.find(p => p.id === endPoiId)?.name || 'Destination';
    
    // Check header/cookie for language preference, fallback to English
    const languageHeader = req.headers.get('accept-language') || 'en';
    let language: 'en' | 'hi' | 'hinglish' | 'es' = 'en';
    if (languageHeader.includes('hinglish')) {
      language = 'hinglish';
    } else if (languageHeader.includes('hi')) {
      language = 'hi';
    } else if (languageHeader.includes('es')) {
      language = 'es';
    }

    const explanationData = await getAIRouteExplanation(
      startName,
      endName,
      routeResult,
      requireAccessible,
      avoidCongested,
      language
    );

    return NextResponse.json(explanationData);
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during processing.'
        }
      },
      { status: 500 }
    );
  }
}
