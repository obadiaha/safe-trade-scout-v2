import { 
  AggregatedData, 
  SafetyAssessment, 
  RiskFlag, 
  Grade, 
  Recommendation 
} from '@/types';
import { WEIGHTS, THRESHOLDS } from '../constants';

/**
 * Detect risk flags based on aggregated data
 */
export function detectFlags(data: AggregatedData): RiskFlag[] {
  const flags: RiskFlag[] = [];
  
  // Honeypot flags
  if (data.honeypot.is_honeypot) {
    flags.push('HONEYPOT');
  }
  
  // Tax flags
  if (data.honeypot.buy_tax > THRESHOLDS.HIGH_TAX) {
    flags.push('HIGH_BUY_TAX');
  }
  if (data.honeypot.sell_tax > THRESHOLDS.HIGH_TAX) {
    flags.push('HIGH_SELL_TAX');
  }
  
  // Liquidity flags
  if (data.liquidity.total_usd < THRESHOLDS.MIN_LIQUIDITY) {
    flags.push('LOW_LIQUIDITY');
  }
  if (data.liquidity.locked_percent === null || data.liquidity.locked_percent < 50) {
    flags.push('NO_LIQUIDITY_LOCK');
  }
  
  // Holder flags
  if (data.holders.top10_percent > THRESHOLDS.HIGH_CONCENTRATION) {
    flags.push('HIGH_HOLDER_CONCENTRATION');
  }
  if (data.holders.whale_alert) {
    flags.push('WHALE_DETECTED');
  }
  
  // Contract permission flags
  if (data.contract.can_mint) {
    flags.push('CAN_MINT');
  }
  if (data.contract.can_pause) {
    flags.push('CAN_PAUSE');
  }
  if (data.contract.can_blacklist) {
    flags.push('CAN_BLACKLIST');
  }
  if (!data.contract.is_open_source) {
    flags.push('CLOSED_SOURCE');
  }
  if (data.contract.is_proxy) {
    flags.push('PROXY_CONTRACT');
  }
  
  return flags;
}

/**
 * Calculate component scores for each risk category
 */
function calculateComponentScores(data: AggregatedData): {
  honeypot: number;
  tax: number;
  liquidity: number;
  holders: number;
  permissions: number;
} {
  // Honeypot score (0 or 100)
  const honeypotScore = data.honeypot.is_honeypot ? 0 : 100;
  
  // Tax score (100 - penalty based on tax rates)
  let taxScore = 100;
  const maxTax = Math.max(data.honeypot.buy_tax, data.honeypot.sell_tax);
  if (maxTax > 20) {
    taxScore = 0;
  } else if (maxTax > THRESHOLDS.HIGH_TAX) {
    taxScore = 50 - (maxTax - THRESHOLDS.HIGH_TAX) * 5;
  } else if (maxTax > THRESHOLDS.MODERATE_TAX) {
    taxScore = 80 - (maxTax - THRESHOLDS.MODERATE_TAX) * 6;
  }
  taxScore = Math.max(0, taxScore);
  
  // Liquidity score
  let liquidityScore = 100;
  if (data.liquidity.total_usd < THRESHOLDS.MIN_LIQUIDITY) {
    liquidityScore = (data.liquidity.total_usd / THRESHOLDS.MIN_LIQUIDITY) * 50;
  } else if (data.liquidity.total_usd < THRESHOLDS.GOOD_LIQUIDITY) {
    liquidityScore = 50 + ((data.liquidity.total_usd - THRESHOLDS.MIN_LIQUIDITY) / 
      (THRESHOLDS.GOOD_LIQUIDITY - THRESHOLDS.MIN_LIQUIDITY)) * 50;
  }
  
  // Holder score
  let holderScore = 100;
  if (data.holders.top_holder_percent > THRESHOLDS.WHALE_THRESHOLD) {
    holderScore -= 40;
  }
  if (data.holders.top10_percent > THRESHOLDS.HIGH_CONCENTRATION) {
    holderScore -= 30;
  }
  if (data.holders.total_count < 100) {
    holderScore -= 20;
  }
  holderScore = Math.max(0, holderScore);
  
  // Permissions score
  let permissionsScore = 100;
  if (!data.contract.is_open_source) permissionsScore -= 30;
  if (data.contract.can_mint) permissionsScore -= 20;
  if (data.contract.can_pause) permissionsScore -= 15;
  if (data.contract.can_blacklist) permissionsScore -= 15;
  if (data.contract.owner_change_balance) permissionsScore -= 25;
  if (data.contract.is_proxy) permissionsScore -= 10;
  permissionsScore = Math.max(0, permissionsScore);
  
  return {
    honeypot: honeypotScore,
    tax: taxScore,
    liquidity: liquidityScore,
    holders: holderScore,
    permissions: permissionsScore
  };
}

/**
 * Calculate overall risk score (0-100)
 */
export function calculateScore(data: AggregatedData): number {
  // If honeypot, instant 0
  if (data.honeypot.is_honeypot) {
    return 0;
  }
  
  const components = calculateComponentScores(data);
  
  const weightedScore = 
    components.honeypot * WEIGHTS.honeypot +
    components.tax * WEIGHTS.tax +
    components.liquidity * WEIGHTS.liquidity +
    components.holders * WEIGHTS.holders +
    components.permissions * WEIGHTS.permissions;
  
  return Math.round(weightedScore);
}

/**
 * Determine letter grade from score
 */
export function determineGrade(score: number): Grade {
  if (score >= THRESHOLDS.GRADE_A) return 'A';
  if (score >= THRESHOLDS.GRADE_B) return 'B';
  if (score >= THRESHOLDS.GRADE_C) return 'C';
  if (score >= THRESHOLDS.GRADE_D) return 'D';
  return 'F';
}

/**
 * Determine recommendation based on score
 */
export function determineRecommendation(score: number): Recommendation {
  if (score >= 75) return 'SAFE';
  if (score >= 50) return 'CAUTION';
  if (score >= 25) return 'RISKY';
  return 'AVOID';
}

/**
 * Generate human-readable summary
 */
export function generateSummary(data: AggregatedData, flags: RiskFlag[]): string {
  if (data.honeypot.is_honeypot) {
    return 'CRITICAL: This token is flagged as a honeypot. Do not trade.';
  }
  
  const issues: string[] = [];
  
  if (flags.includes('HIGH_SELL_TAX')) {
    issues.push(`high sell tax (${data.honeypot.sell_tax.toFixed(1)}%)`);
  }
  if (flags.includes('HIGH_BUY_TAX')) {
    issues.push(`high buy tax (${data.honeypot.buy_tax.toFixed(1)}%)`);
  }
  if (flags.includes('LOW_LIQUIDITY')) {
    issues.push('low liquidity');
  }
  if (flags.includes('WHALE_DETECTED')) {
    issues.push('whale concentration detected');
  }
  if (flags.includes('CAN_MINT')) {
    issues.push('mintable token');
  }
  if (flags.includes('CLOSED_SOURCE')) {
    issues.push('closed source contract');
  }
  
  if (issues.length === 0) {
    return 'No major risk factors detected. Standard precautions advised.';
  }
  
  if (issues.length === 1) {
    return `Moderate risk: ${issues[0]}.`;
  }
  
  return `Risk factors: ${issues.join(', ')}.`;
}

/**
 * Full safety assessment from aggregated data
 */
export function assessSafety(data: AggregatedData): SafetyAssessment {
  const flags = detectFlags(data);
  const score = calculateScore(data);
  const grade = determineGrade(score);
  const recommendation = determineRecommendation(score);
  const summary = generateSummary(data, flags);
  
  return {
    score,
    grade,
    recommendation,
    summary
  };
}
