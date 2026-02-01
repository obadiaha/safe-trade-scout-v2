import { DexScreenerResponse, LiquidityData } from '@/types';
import { API_URLS, TIMEOUTS } from '../constants';
import { getChainConfig } from '../utils/chains';
import { SupportedChain } from '../utils/validation';

export interface DexScreenerResult {
  liquidity: LiquidityData;
  success: boolean;
}

export async function fetchDexScreener(token: string, chain: SupportedChain): Promise<DexScreenerResult> {
  const chainConfig = getChainConfig(chain);
  const url = `${API_URLS.DEXSCREENER_BASE}/tokens/${token}`;
  
  const defaultResult: DexScreenerResult = {
    liquidity: {
      total_usd: 0,
      main_pair: null,
      dex: null,
      locked_percent: null,
      lock_end_date: null
    },
    success: false
  };
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.DEXSCREENER);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`DEXScreener API error: ${response.status}`);
      return defaultResult;
    }
    
    const data: DexScreenerResponse = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) {
      console.warn(`No pairs found for token ${token}`);
      return defaultResult;
    }
    
    // Filter pairs by chain
    const chainPairs = data.pairs.filter(
      p => p.chainId.toLowerCase() === chainConfig.dexscreenerChainId.toLowerCase()
    );
    
    if (chainPairs.length === 0) {
      console.warn(`No pairs found for token ${token} on chain ${chain}`);
      return defaultResult;
    }
    
    // Get the pair with highest liquidity
    const sortedPairs = chainPairs.sort(
      (a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
    );
    
    const mainPair = sortedPairs[0];
    
    // Sum total liquidity across all pairs
    const totalLiquidity = chainPairs.reduce(
      (sum, pair) => sum + (pair.liquidity?.usd || 0),
      0
    );
    
    return {
      liquidity: {
        total_usd: Math.round(totalLiquidity),
        main_pair: mainPair.pairAddress,
        dex: mainPair.dexId,
        locked_percent: null, // DEXScreener doesn't provide this
        lock_end_date: null
      },
      success: true
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('DEXScreener API timeout');
    } else {
      console.error('DEXScreener API error:', error);
    }
    return defaultResult;
  }
}
