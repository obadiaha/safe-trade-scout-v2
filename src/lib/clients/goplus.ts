import { GoPlusResponse, GoPlusTokenData, HoneypotData, ContractData, HolderData } from '@/types';
import { API_URLS, TIMEOUTS } from '../constants';
import { getChainConfig } from '../utils/chains';
import { SupportedChain } from '../utils/validation';

export interface GoPlusResult {
  honeypot: HoneypotData;
  contract: ContractData;
  holders: HolderData;
  raw: GoPlusTokenData | null;
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function parseBool(value: string | undefined): boolean {
  return value === '1';
}

function extractHoneypotData(data: GoPlusTokenData): HoneypotData {
  return {
    is_honeypot: parseBool(data.is_honeypot),
    buy_tax: parseNumber(data.buy_tax) * 100,
    sell_tax: parseNumber(data.sell_tax) * 100,
    transfer_pausable: parseBool(data.transfer_pausable),
    is_blacklisted: parseBool(data.is_blacklisted)
  };
}

function extractContractData(data: GoPlusTokenData): ContractData {
  return {
    is_open_source: parseBool(data.is_open_source),
    is_proxy: parseBool(data.is_proxy),
    can_mint: parseBool(data.is_mintable),
    can_pause: parseBool(data.transfer_pausable),
    can_blacklist: parseBool(data.is_blacklisted),
    owner_change_balance: parseBool(data.owner_change_balance)
  };
}

function extractHolderData(data: GoPlusTokenData): HolderData {
  const holderCount = parseInt(data.holder_count || '0', 10);
  
  // Calculate top 10 holder concentration
  let top10Percent = 0;
  let topHolderPercent = 0;
  
  if (data.holders && data.holders.length > 0) {
    const sortedHolders = [...data.holders].sort(
      (a, b) => parseFloat(b.percent) - parseFloat(a.percent)
    );
    
    topHolderPercent = parseFloat(sortedHolders[0]?.percent || '0') * 100;
    
    const top10 = sortedHolders.slice(0, 10);
    top10Percent = top10.reduce((sum, h) => sum + parseFloat(h.percent || '0'), 0) * 100;
  }
  
  return {
    total_count: holderCount,
    top10_percent: Math.round(top10Percent * 100) / 100,
    top_holder_percent: Math.round(topHolderPercent * 100) / 100,
    whale_alert: topHolderPercent > 25
  };
}

export async function fetchGoPlus(token: string, chain: SupportedChain): Promise<GoPlusResult> {
  const chainConfig = getChainConfig(chain);
  const url = `${API_URLS.GOPLUS_BASE}/token_security/${chainConfig.goplusChainId}?contract_addresses=${token}`;
  
  const defaultResult: GoPlusResult = {
    honeypot: {
      is_honeypot: false,
      buy_tax: 0,
      sell_tax: 0,
      transfer_pausable: false,
      is_blacklisted: false
    },
    contract: {
      is_open_source: false,
      is_proxy: false,
      can_mint: false,
      can_pause: false,
      can_blacklist: false,
      owner_change_balance: false
    },
    holders: {
      total_count: 0,
      top10_percent: 0,
      top_holder_percent: 0,
      whale_alert: false
    },
    raw: null
  };
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.GOPLUS);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...(process.env.GOPLUS_API_KEY && {
          'Authorization': `Bearer ${process.env.GOPLUS_API_KEY}`
        })
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`GoPlus API error: ${response.status}`);
      return defaultResult;
    }
    
    const data: GoPlusResponse = await response.json();
    
    if (data.code !== 1 || !data.result) {
      console.error(`GoPlus returned non-success code: ${data.code}`);
      return defaultResult;
    }
    
    const tokenData = data.result[token.toLowerCase()];
    if (!tokenData) {
      console.warn(`No data found for token ${token}`);
      return defaultResult;
    }
    
    return {
      honeypot: extractHoneypotData(tokenData),
      contract: extractContractData(tokenData),
      holders: extractHolderData(tokenData),
      raw: tokenData
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('GoPlus API timeout');
    } else {
      console.error('GoPlus API error:', error);
    }
    return defaultResult;
  }
}
