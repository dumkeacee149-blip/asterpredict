import { createBailianClient, MODELS } from "@/lib/bailian";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Missing messages" }, { status: 400 });
    }

    const client = createBailianClient();

    const stream = await client.chat.completions.create({
      model: MODELS.chat,
      messages: [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
      stream: true,
      temperature: 0.8,
      max_tokens: 500,
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
        } catch {
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
