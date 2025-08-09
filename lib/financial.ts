import { FMP_API_KEY } from './config';

export type FxRates = Record<string, number>; // currency code -> USD rate

// A more complete fallback map; values are approximate and only used if live fetch fails
const FALLBACK_FX_TO_USD: FxRates = {
  USD: 1,
  EUR: 1.09,
  GBP: 1.29,
  JPY: 0.0063,
  CNY: 0.14,
  CNH: 0.14,
  HKD: 0.13,
  TWD: 0.031,
  KRW: 0.00074,
  INR: 0.012,
  SGD: 0.74,
  AUD: 0.67,
  CAD: 0.73,
  CHF: 1.12,
  SEK: 0.096,
  NOK: 0.094,
  DKK: 0.146,
  ZAR: 0.055,
  MXN: 0.056,
  BRL: 0.18,
  TRY: 0.030,
  PLN: 0.26,
  CZK: 0.044,
  HUF: 0.0027,
  ILS: 0.27,
  SAR: 0.27,
  AED: 0.27,
  THB: 0.027,
  MYR: 0.22,
  PHP: 0.017,
  IDR: 0.000061,
  VND: 0.000039,
};

let cachedRates: FxRates | null = null;
let cachedAt = 0;
const CACHE_MS = 60 * 60 * 1000; // 1 hour

export async function getFxToUSD(): Promise<FxRates> {
  const now = Date.now();
  if (cachedRates && now - cachedAt < CACHE_MS) return cachedRates;

  try {
    // FMP docs: /api/v3/forex - but we’ll compose from individual pairs via quote endpoint
    // We’ll fetch a basket for the currencies we see in FALLBACK_FX_TO_USD (excluding USD) and invert to USD where needed
    const codes = Object.keys(FALLBACK_FX_TO_USD).filter((c) => c !== 'USD');
    const queries = codes.map((code) => `USD${code}`); // e.g., USDJPY => price is JPY per USD
    const url = `https://financialmodelingprep.com/api/v3/quotes/forex?apikey=${FMP_API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`FX fetch failed: ${resp.status}`);
    const data = await resp.json();

    const out: FxRates = { USD: 1 };
    // Build a lookup of symbol->price
    const map: Record<string, number> = {};
    if (Array.isArray(data)) {
      for (const row of data) {
        if (row && typeof row.symbol === 'string' && typeof row.price === 'number') {
          map[row.symbol.toUpperCase()] = row.price;
        }
      }
    }
    for (const code of codes) {
      const sym = `USD${code}`;
      const price = map[sym];
      if (typeof price === 'number' && price > 0) {
        // price = units of code per 1 USD; to convert code->USD rate: 1 unit code = 1/price USD
        out[code] = 1 / price;
      } else {
        out[code] = FALLBACK_FX_TO_USD[code];
      }
    }
    cachedRates = out;
    cachedAt = now;
    return out;
  } catch {
    cachedRates = { ...FALLBACK_FX_TO_USD };
    cachedAt = now;
    return cachedRates;
  }
}

export function fxToUSD(rates: FxRates, code: string | undefined | null): number {
  if (!code) return 1;
  const uc = String(code).toUpperCase();
  return rates[uc] ?? FALLBACK_FX_TO_USD[uc] ?? 1;
} 