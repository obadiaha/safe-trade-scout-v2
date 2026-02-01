import { SupportedChain } from './validation';

export interface ChainConfig {
  id: number;
  name: string;
  goplusChainId: string;
  dexscreenerChainId: string;
}

export const CHAIN_CONFIG: Record<SupportedChain, ChainConfig> = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    goplusChainId: '1',
    dexscreenerChainId: 'ethereum'
  },
  bsc: {
    id: 56,
    name: 'BNB Smart Chain',
    goplusChainId: '56',
    dexscreenerChainId: 'bsc'
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    goplusChainId: '137',
    dexscreenerChainId: 'polygon'
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    goplusChainId: '42161',
    dexscreenerChainId: 'arbitrum'
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    goplusChainId: '10',
    dexscreenerChainId: 'optimism'
  },
  avalanche: {
    id: 43114,
    name: 'Avalanche C-Chain',
    goplusChainId: '43114',
    dexscreenerChainId: 'avalanche'
  },
  base: {
    id: 8453,
    name: 'Base',
    goplusChainId: '8453',
    dexscreenerChainId: 'base'
  }
};

export function getChainConfig(chain: SupportedChain): ChainConfig {
  return CHAIN_CONFIG[chain];
}
