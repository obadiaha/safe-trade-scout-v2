import { NextRequest, NextResponse } from 'next/server';
import { validateRequest, SupportedChain } from '@/lib/utils/validation';
import { getFromCache, setCache } from '@/lib/utils/cache';
import { fetchGoPlus } from '@/lib/clients/goplus';
import { fetchDexScreener } from '@/lib/clients/dexscreener';
import { assessSafety, detectFlags } from '@/lib/analysis/risk-engine';
import { ApiResponse, CheckResult, AggregatedData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Request body must be valid JSON'
        }
      } as ApiResponse, { status: 400 });
    }
    
    // Validate input
    const validation = validateRequest(body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error
        }
      } as ApiResponse, { status: 400 });
    }
    
    const { token, chain } = validation.data;
    
    // Check cache
    const cached = getFromCache(token, chain);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: { ...cached, cached: true }
      } as ApiResponse);
    }
    
    // Fetch data from all sources in parallel
    const [goplusResult, dexResult] = await Promise.all([
      fetchGoPlus(token, chain as SupportedChain),
      fetchDexScreener(token, chain as SupportedChain)
    ]);
    
    // Aggregate data
    const aggregatedData: AggregatedData = {
      honeypot: goplusResult.honeypot,
      liquidity: dexResult.liquidity,
      holders: goplusResult.holders,
      contract: goplusResult.contract
    };
    
    // Calculate risk assessment
    const safety = assessSafety(aggregatedData);
    const flags = detectFlags(aggregatedData);
    
    // Build response
    const result: CheckResult = {
      token: token.toLowerCase(),
      chain,
      safety,
      honeypot: aggregatedData.honeypot,
      liquidity: aggregatedData.liquidity,
      holders: aggregatedData.holders,
      contract: aggregatedData.contract,
      flags,
      sources: {
        goplus: goplusResult.raw !== null,
        dexscreener: dexResult.success,
        holders: goplusResult.raw !== null
      },
      cached: false,
      checked_at: new Date().toISOString()
    };
    
    // Store in cache
    setCache(token, chain, result);
    
    return NextResponse.json({
      success: true,
      data: result
    } as ApiResponse);
    
  } catch (error) {
    console.error('Check endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    } as ApiResponse, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Use POST method with { "token": "0x...", "chain": "ethereum" }'
    }
  } as ApiResponse, { status: 405 });
}
