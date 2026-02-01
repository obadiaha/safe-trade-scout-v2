# Safe Trade Scout v2

Pre-trade safety API that aggregates token security data from multiple sources (GoPlus + DEXScreener + on-chain holder analysis) into a single response with actionable risk assessment.

## Features

- 🔍 Multi-source data aggregation (GoPlus, DEXScreener)
- 📊 Weighted risk scoring (0-100 scale)
- 🎯 Letter grades (A-F) with recommendations
- ⚡ LRU caching (5 min TTL)
- 🔒 Input validation with Zod
- 🏥 Health check endpoint
- 🌐 7 supported chains

## Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:3000 for API documentation and interactive testing.

## API Endpoints

### POST /api/check

Check token safety:

```bash
curl -X POST http://localhost:3000/api/check \
  -H "Content-Type: application/json" \
  -d '{"token":"0x6982508145454Ce325dDbE47a25d4ec3d2311933","chain":"ethereum"}'
```

### GET /api/health

Health check:

```bash
curl http://localhost:3000/api/health
```

## Supported Chains

- Ethereum
- BSC
- Polygon
- Arbitrum
- Optimism
- Avalanche
- Base

## Response Example

```json
{
  "success": true,
  "data": {
    "token": "0x...",
    "chain": "ethereum",
    "safety": {
      "score": 72,
      "grade": "B",
      "recommendation": "CAUTION",
      "summary": "Moderate risk. High sell tax detected."
    },
    "honeypot": { ... },
    "liquidity": { ... },
    "holders": { ... },
    "contract": { ... },
    "flags": ["HIGH_SELL_TAX"],
    "cached": false,
    "checked_at": "2024-01-15T10:30:00Z"
  }
}
```

## Risk Scoring Weights

| Factor | Weight |
|--------|--------|
| Honeypot | 30% |
| Tax Rate | 20% |
| Liquidity | 20% |
| Holder Distribution | 15% |
| Contract Permissions | 15% |

## Environment Variables

```bash
# Optional: GoPlus API key for higher rate limits
GOPLUS_API_KEY=

# Cache TTL in seconds (default: 300)
CACHE_TTL=300
```

## Development

```bash
# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## License

MIT
