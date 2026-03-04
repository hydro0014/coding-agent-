import { NextRequest } from "next/server";
import { model, SYSTEM_PROMPT } from "@/lib/gemini";
import { tools, toolDefinitions, ToolName } from "@/lib/tools";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "Prompt is required" }), {
      status: 400,
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const chatSession = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: SYSTEM_PROMPT }],
            },
            {
              role: "model",
              parts: [{ text: "Understood. I am ready to assist as your expert AI software engineer." }],
            },
          ],
          tools: [{ functionDeclarations: toolDefinitions as any }],
        });

        sendUpdate({ type: "status", message: "Analyzing task and planning..." });

        let result = await chatSession.sendMessage(prompt);
        let response = result.response;

        let iterations = 0;
        const maxIterations = 15;

        while (iterations < maxIterations) {
          iterations++;
          const parts = response.candidates?.[0]?.content?.parts || [];
          const toolCalls = parts.filter((part: any) => part.functionCall);
          const textResponse = parts.filter((part: any) => part.text).map((part: any) => part.text).join("\n");

          if (textResponse) {
            sendUpdate({ type: "thought", message: textResponse });
          }

          if (toolCalls.length === 0) {
            break;
          }

          const toolResponses = [];
          for (const call of toolCalls) {
            const { name, args } = call.functionCall;
            sendUpdate({ type: "tool_call", name, args });

            const toolFn = tools[name as ToolName];
            if (toolFn) {
              // Pass args object directly to the tool function
              const toolResult = await (toolFn as any)(args);
              toolResponses.push({
                functionResponse: {
                  name,
                  response: { result: toolResult },
                },
              });
              sendUpdate({ type: "tool_result", name, result: toolResult });
            } else {
              toolResponses.push({
                functionResponse: {
                  name,
                  response: { error: `Tool ${name} not found` },
                },
              });
            }
          }

          result = await chatSession.sendMessage(toolResponses);
          response = result.response;
        }

        sendUpdate({ type: "done", message: "Task completed." });
        controller.close();
      } catch (error: any) {
        console.error("Agent Error:", error);
        sendUpdate({ type: "error", message: error.message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
