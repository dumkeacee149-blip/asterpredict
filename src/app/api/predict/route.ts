import { createBailianClient, MODELS } from "@/lib/bailian";
import { PREDICTION_SYSTEM_PROMPT, buildPredictionUserPrompt } from "@/lib/prompts";
import { getMarketData } from "@/lib/coingecko";
import { SUPPORTED_TOKENS } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { token, timeframe } = await request.json();

    if (!token || !timeframe) {
      return Response.json({ error: "Missing token or timeframe" }, { status: 400 });
    }

    if (!SUPPORTED_TOKENS[token]) {
      return Response.json({ error: "Unsupported token" }, { status: 400 });
    }

    const marketData = await getMarketData(token);
    const client = createBailianClient();

    const userPrompt = buildPredictionUserPrompt(
      token,
      timeframe,
      marketData ? { price: marketData.price, change24h: marketData.change24h, volume24h: marketData.volume24h } : undefined
    );

    const stream = await client.chat.completions.create({
      model: MODELS.predict,
      messages: [
        { role: "system", content: PREDICTION_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      stream: true,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
