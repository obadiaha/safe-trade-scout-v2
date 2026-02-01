import { GoPlusResult } from '../clients/goplus';
import { HolderData } from '@/types';
import { THRESHOLDS } from '../constants';

/**
 * Analyze holder distribution for risk factors
 */
export function analyzeHolders(goplusResult: GoPlusResult): {
  data: HolderData;
  warnings: string[];
} {
  const data = goplusResult.holders;
  const warnings: string[] = [];
  
  // Check for whale
  if (data.top_holder_percent > THRESHOLDS.WHALE_THRESHOLD) {
    warnings.push(`Top holder owns ${data.top_holder_percent.toFixed(1)}% of supply`);
  }
  
  // Check for high concentration
  if (data.top10_percent > THRESHOLDS.HIGH_CONCENTRATION) {
    warnings.push(`Top 10 holders own ${data.top10_percent.toFixed(1)}% of supply`);
  }
  
  // Check for low holder count
  if (data.total_count < 100) {
    warnings.push(`Only ${data.total_count} holders - limited distribution`);
  }
  
  return { data, warnings };
}

/**
 * Calculate holder concentration score (0-100)
 * Higher score = better distribution
 */
export function calculateHolderScore(data: HolderData): number {
  let score = 100;
  
  // Penalize whale holdings
  if (data.top_holder_percent > THRESHOLDS.WHALE_THRESHOLD) {
    score -= 30;
  } else if (data.top_holder_percent > 15) {
    score -= 15;
  } else if (data.top_holder_percent > 10) {
    score -= 5;
  }
  
  // Penalize high concentration in top 10
  if (data.top10_percent > THRESHOLDS.HIGH_CONCENTRATION) {
    score -= 25;
  } else if (data.top10_percent > 40) {
    score -= 15;
  } else if (data.top10_percent > 30) {
    score -= 5;
  }
  
  // Penalize low holder count
  if (data.total_count < 50) {
    score -= 20;
  } else if (data.total_count < 100) {
    score -= 10;
  } else if (data.total_count < 500) {
    score -= 5;
  }
  
  return Math.max(0, score);
}
