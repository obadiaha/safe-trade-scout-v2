import { NextResponse } from 'next/server';
import { HealthResponse } from '@/types';
import { getCacheSize } from '@/lib/utils/cache';

const startTime = Date.now();

export async function GET() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  
  const response: HealthResponse = {
    status: 'healthy',
    version: '2.0.0',
    uptime,
    cache_size: getCacheSize()
  };
  
  return NextResponse.json(response);
}
