export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type Recommendation = 'SAFE' | 'CAUTION' | 'RISKY' | 'AVOID';

export interface SafetyAssessment {
  score: number;           // 0-100
  grade: Grade;
  recommendation: Recommendation;
  summary: string;
}

export interface HoneypotData {
  is_honeypot: boolean;
  buy_tax: number;
  sell_tax: number;
  transfer_pausable: boolean;
  is_blacklisted: boolean;
}

export interface LiquidityData {
  total_usd: number;
  main_pair: string | null;
  dex: string | null;
  locked_percent: number | null;
  lock_end_date: string | null;
}

export interface HolderData {
  total_count: number;
  top10_percent: number;
  top_holder_percent: number;
  whale_alert: boolean;
}

export interface ContractData {
  is_open_source: boolean;
  is_proxy: boolean;
  can_mint: boolean;
  can_pause: boolean;
  can_blacklist: boolean;
  owner_change_balance: boolean;
}

export type RiskFlag = 
  | 'HONEYPOT'
  | 'HIGH_BUY_TAX'
  | 'HIGH_SELL_TAX'
  | 'LOW_LIQUIDITY'
  | 'NO_LIQUIDITY_LOCK'
  | 'HIGH_HOLDER_CONCENTRATION'
  | 'WHALE_DETECTED'
  | 'CAN_MINT'
  | 'CAN_PAUSE'
  | 'CAN_BLACKLIST'
  | 'CLOSED_SOURCE'
  | 'PROXY_CONTRACT';

export interface CheckResult {
  token: string;
  chain: string;
  safety: SafetyAssessment;
  honeypot: HoneypotData;
  liquidity: LiquidityData;
  holders: HolderData;
  contract: ContractData;
  flags: RiskFlag[];
  sources: {
    goplus: boolean;
    dexscreener: boolean;
    holders: boolean;
  };
  cached: boolean;
  checked_at: string;
}

export interface AggregatedData {
  honeypot: HoneypotData;
  liquidity: LiquidityData;
  holders: HolderData;
  contract: ContractData;
}
