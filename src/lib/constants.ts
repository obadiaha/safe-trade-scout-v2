// Risk scoring weights (must sum to 1.0)
export const WEIGHTS = {
  honeypot: 0.30,      // 30% - Most critical
  tax: 0.20,           // 20% - Direct financial impact
  liquidity: 0.20,     // 20% - Exit capability
  holders: 0.15,       // 15% - Distribution health
  permissions: 0.15    // 15% - Contract risk
} as const;

// Thresholds for risk detection
export const THRESHOLDS = {
  // Tax thresholds (percentage)
  HIGH_TAX: 10,
  MODERATE_TAX: 5,
  
  // Liquidity thresholds (USD)
  MIN_LIQUIDITY: 10000,
  GOOD_LIQUIDITY: 50000,
  
  // Holder concentration thresholds (percentage)
  HIGH_CONCENTRATION: 50,
  WHALE_THRESHOLD: 25,
  
  // Score to grade mapping
  GRADE_A: 80,
  GRADE_B: 60,
  GRADE_C: 40,
  GRADE_D: 20
} as const;

// API timeouts
export const TIMEOUTS = {
  GOPLUS: 10000,       // 10 seconds
  DEXSCREENER: 10000,  // 10 seconds
  HOLDER: 10000        // 10 seconds
} as const;

// API URLs
export const API_URLS = {
  GOPLUS_BASE: 'https://api.gopluslabs.io/api/v1',
  DEXSCREENER_BASE: 'https://api.dexscreener.com/latest/dex'
} as const;
