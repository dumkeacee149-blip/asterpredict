import { getAllMarketData } from "@/lib/coingecko";

export async function GET() {
  try {
    const data = await getAllMarketData();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Failed to fetch market data" }, { status: 500 });
  }
}
