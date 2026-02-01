'use client';

import { useState } from 'react';
import { CheckResult } from '@/types';

const EXAMPLE_TOKENS = [
  { name: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', chain: 'ethereum' },
  { name: 'PEPE', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', chain: 'ethereum' },
  { name: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', chain: 'ethereum' },
];

export default function Home() {
  const [token, setToken] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, chain }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const getGradeClass = (grade: string) => {
    switch (grade) {
      case 'A': return 'grade-a';
      case 'B': return 'grade-b';
      case 'C': return 'grade-c';
      case 'D': return 'grade-d';
      default: return 'grade-f';
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Safe Trade Scout v2</h1>
        <p className="text-gray-400 mb-8">
          Pre-trade safety API for token security analysis
        </p>
        
        {/* API Documentation */}
        <section className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">API Documentation</h2>
          
          <div className="mb-4">
            <h3 className="font-semibold text-green-400">POST /api/check</h3>
            <p className="text-gray-400 text-sm mb-2">Check token safety</p>
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
{`curl -X POST http://localhost:3000/api/check \\
  -H "Content-Type: application/json" \\
  -d '{"token":"0x...", "chain":"ethereum"}'`}
            </pre>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold text-green-400">GET /api/health</h3>
            <p className="text-gray-400 text-sm mb-2">Health check endpoint</p>
            <pre className="bg-gray-900 p-4 rounded text-sm">
{`curl http://localhost:3000/api/health`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Supported Chains</h3>
            <div className="flex flex-wrap gap-2">
              {['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'base'].map(c => (
                <span key={c} className="bg-gray-700 px-3 py-1 rounded text-sm">{c}</span>
              ))}
            </div>
          </div>
        </section>
        
        {/* Try It Out */}
        <section className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Try It Out</h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token address (0x...)"
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-4 py-2"
            />
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-4 py-2"
            >
              <option value="ethereum">Ethereum</option>
              <option value="bsc">BSC</option>
              <option value="polygon">Polygon</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="optimism">Optimism</option>
              <option value="avalanche">Avalanche</option>
              <option value="base">Base</option>
            </select>
            <button
              onClick={handleCheck}
              disabled={loading || !token}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded font-semibold"
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
          
          <div className="flex gap-2 mb-4">
            <span className="text-sm text-gray-400">Quick fill:</span>
            {EXAMPLE_TOKENS.map(t => (
              <button
                key={t.address}
                onClick={() => { setToken(t.address); setChain(t.chain); }}
                className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
              >
                {t.name}
              </button>
            ))}
          </div>
          
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded p-4 mb-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-gray-900 rounded p-4">
              {/* Safety Summary */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700">
                <div className={`text-6xl font-bold ${getGradeClass(result.safety.grade)}`}>
                  {result.safety.grade}
                </div>
                <div>
                  <div className="text-2xl font-semibold">
                    Score: {result.safety.score}/100
                  </div>
                  <div className={`text-lg ${
                    result.safety.recommendation === 'SAFE' ? 'text-green-400' :
                    result.safety.recommendation === 'CAUTION' ? 'text-yellow-400' :
                    result.safety.recommendation === 'RISKY' ? 'text-orange-400' :
                    'text-red-400'
                  }`}>
                    {result.safety.recommendation}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    {result.safety.summary}
                  </div>
                </div>
              </div>
              
              {/* Flags */}
              {result.flags.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Risk Flags</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.flags.map(flag => (
                      <span key={flag} className="bg-red-900/50 text-red-400 px-2 py-1 rounded text-sm">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-400 mb-2">Honeypot Analysis</h4>
                  <div className="space-y-1">
                    <div>Honeypot: {result.honeypot.is_honeypot ? '⚠️ Yes' : '✅ No'}</div>
                    <div>Buy Tax: {result.honeypot.buy_tax.toFixed(1)}%</div>
                    <div>Sell Tax: {result.honeypot.sell_tax.toFixed(1)}%</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-400 mb-2">Liquidity</h4>
                  <div className="space-y-1">
                    <div>Total: ${result.liquidity.total_usd.toLocaleString()}</div>
                    <div>DEX: {result.liquidity.dex || 'Unknown'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-400 mb-2">Holders</h4>
                  <div className="space-y-1">
                    <div>Total: {result.holders.total_count.toLocaleString()}</div>
                    <div>Top 10: {result.holders.top10_percent.toFixed(1)}%</div>
                    <div>Top Holder: {result.holders.top_holder_percent.toFixed(1)}%</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-400 mb-2">Contract</h4>
                  <div className="space-y-1">
                    <div>Open Source: {result.contract.is_open_source ? '✅' : '⚠️'}</div>
                    <div>Mintable: {result.contract.can_mint ? '⚠️' : '✅'}</div>
                    <div>Proxy: {result.contract.is_proxy ? '⚠️' : '✅'}</div>
                  </div>
                </div>
              </div>
              
              {/* Metadata */}
              <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
                <div>Checked: {new Date(result.checked_at).toLocaleString()}</div>
                <div>Cached: {result.cached ? 'Yes' : 'No'}</div>
                <div>Sources: GoPlus {result.sources.goplus ? '✓' : '✗'} | DEXScreener {result.sources.dexscreener ? '✓' : '✗'}</div>
              </div>
            </div>
          )}
        </section>
        
        {/* Response Schema */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Response Schema</h2>
          <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "token": "0x...",
    "chain": "ethereum",
    "safety": {
      "score": 72,          // 0-100
      "grade": "B",         // A, B, C, D, F
      "recommendation": "CAUTION",
      "summary": "Moderate risk. High sell tax detected."
    },
    "honeypot": { ... },
    "liquidity": { ... },
    "holders": { ... },
    "contract": { ... },
    "flags": ["HIGH_SELL_TAX", ...],
    "sources": { "goplus": true, ... },
    "cached": false,
    "checked_at": "2024-01-15T10:30:00Z"
  }
}`}
          </pre>
        </section>
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          Safe Trade Scout v2.0.0 | Built by Clawd
        </footer>
      </div>
    </main>
  );
}
