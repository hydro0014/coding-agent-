import { NextRequest } from "next/server";
import { model, SYSTEM_PROMPT } from "@/lib/gemini";
import { tools, toolDefinitions, ToolName } from "@/lib/tools";
import { Part, FunctionDeclaration } from "@google/generative-ai";

export const dynamic = "force-dynamic";

interface AgentUpdate {
  type: "status" | "thought" | "tool_call" | "tool_result" | "done" | "error";
  message?: string;
  name?: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

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
      const sendUpdate = (data: AgentUpdate) => {
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
          tools: [{ functionDeclarations: toolDefinitions as unknown as FunctionDeclaration[] }],
        });

        sendUpdate({ type: "status", message: "Analyzing task and planning..." });

        let result = await chatSession.sendMessage(prompt);
        let response = result.response;

        let iterations = 0;
        const maxIterations = 15;

        while (iterations < maxIterations) {
          iterations++;
          const candidate = response.candidates?.[0];
          const parts = candidate?.content?.parts || [];

          const toolCalls = parts.filter(part => part.functionCall);
          const textResponse = parts.filter(part => part.text).map(part => part.text).join("\n");

          if (textResponse) {
            sendUpdate({ type: "thought", message: textResponse });
          }

          if (toolCalls.length === 0) {
            break;
          }

          const toolResponses: Part[] = [];
          for (const call of toolCalls) {
            if (!call.functionCall) continue;

            const { name, args } = call.functionCall;
            sendUpdate({ type: "tool_call", name, args: args as Record<string, unknown> });

            const toolFn = tools[name as ToolName];
            if (toolFn) {
              const toolResult = await (toolFn as (args: unknown) => Promise<unknown>)(args);
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
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Agent Error:", errorMessage);
        sendUpdate({ type: "error", message: errorMessage });
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
