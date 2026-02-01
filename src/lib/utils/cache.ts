import { LRUCache } from 'lru-cache';
import { CheckResult } from '@/types';

const CACHE_TTL_MS = parseInt(process.env.CACHE_TTL || '300') * 1000;

const cache = new LRUCache<string, CheckResult>({
  max: 500, // Maximum 500 entries
  ttl: CACHE_TTL_MS,
  updateAgeOnGet: false
});

export function getCacheKey(token: string, chain: string): string {
  return `${chain}:${token.toLowerCase()}`;
}

export function getFromCache(token: string, chain: string): CheckResult | undefined {
  const key = getCacheKey(token, chain);
  return cache.get(key);
}

export function setCache(token: string, chain: string, result: CheckResult): void {
  const key = getCacheKey(token, chain);
  cache.set(key, result);
}

export function getCacheSize(): number {
  return cache.size;
}

export function clearCache(): void {
  cache.clear();
}
