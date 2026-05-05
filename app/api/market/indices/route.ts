import { NextResponse } from "next/server";

type FinnhubQuote = {
  c: number;   // current price
  d: number;   // change
  dp: number;  // percent change
  h: number;   // high
  l: number;   // low
  o: number;   // open
  pc: number;  // previous close
  t: number;   // timestamp
};

const INDICES = [
  { symbol: "SPY", name: "S&P 500", description: "S&P 500 ETF" },
  { symbol: "QQQ", name: "NASDAQ-100", description: "NASDAQ-100 ETF" },
  { symbol: "DIA", name: "Dow Jones", description: "Dow Jones Industrial" },
  { symbol: "IWM", name: "Russell 2000", description: "Small Cap" },
  { symbol: "GLD", name: "Gold", description: "Gold ETF" },
  { symbol: "USO", name: "Oil", description: "WTI Crude Oil" },
];

async function fetchQuote(symbol: string, token: string): Promise<FinnhubQuote | null> {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.c === 0 && data.d === 0 && data.pc === 0) return null;
    return data;
  } catch {
    return null;
  }
}

export async function GET() {
  const token = process.env.FINNHUB_API_KEY;

  if (!token) {
    return NextResponse.json({
      indices: INDICES.map((i) => ({
        symbol: i.symbol,
        name: i.name,
        description: i.description,
        price: 0,
        change: 0,
        changePercent: 0,
        live: false,
      })),
      message: "Add FINNHUB_API_KEY to .env.local for live data",
    });
  }

  const results = await Promise.all(
    INDICES.map(async (idx) => {
      const quote = await fetchQuote(idx.symbol, token);
      return {
        symbol: idx.symbol,
        name: idx.name,
        description: idx.description,
        price: quote?.c ?? 0,
        change: quote?.d ?? 0,
        changePercent: quote?.dp ?? 0,
        live: !!quote,
      };
    })
  );

  return NextResponse.json({ indices: results });
}
