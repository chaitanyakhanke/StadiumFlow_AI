import { NextRequest, NextResponse } from 'next/server';
import { CopilotRequestSchema } from '@/lib/ai/schemas';
import { getAIEstimateReply } from '@/lib/ai/gemini';
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
    const result = CopilotRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request parameters.',
            fields: result.error.format()
          }
        },
        { status: 400 }
      );
    }

    const { message, history, language, userRole, stadiumState } = result.data;

    // Security check: Protect Operator / Volunteer role actions from spoofed client queries
    if (userRole === 'operator' || userRole === 'volunteer') {
      const authHeader = req.headers.get('x-stadiumflow-auth');
      if (process.env.NODE_ENV === 'production' && authHeader !== 'sec_stadium_2026_token') {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED_ROLE', message: 'Security check: Invalid authorization for elevated API privileges.' } },
          { status: 403 }
        );
      }
    }

    // Call Gemini API (with deterministic fallback internally if key is missing or calls fail)
    const replyData = await getAIEstimateReply(
      message,
      history,
      language,
      userRole,
      stadiumState
    );

    return NextResponse.json(replyData);
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
