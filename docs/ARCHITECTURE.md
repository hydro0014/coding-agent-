# GeminiAgent Architecture

GeminiAgent is a sophisticated AI-powered coding assistant that operates on a "Analyze-Plan-Execute-Verify" cycle.

## Core Components

### 1. Backend AI Integration (`src/lib/gemini.ts`)
Uses the `@google/generative-ai` SDK to interface with Gemini 2.0 Flash. It includes a specialized system prompt that defines the agent's persona and operational constraints.

### 2. Tool System (`src/lib/tools.ts`)
Provides the agent with capabilities to interact with the environment:
- **File System:** `listFiles`, `readFile`, `writeFile`, `deleteFile`.
- **System:** `runShellCommand` (allows installing dependencies, running tests, executing scripts).

### 3. Agentic Loop (`src/app/api/agent/route.ts`)
The orchestrator of the agent's behavior:
- **Task Decomposition:** The agent first creates a mental model and a plan.
- **Execution Loop:** Sequentially calls tools based on the plan.
- **Streaming:** Uses Server-Sent Events (SSE) to provide real-time visibility into the agent's "thoughts" and tool actions.

### 4. Reactive UI (`src/app/page.tsx` & components)
- **ChatInterface:** Real-time feedback of the agent's internal reasoning and tool outputs.
- **TaskProgress:** Visual representation of the agent's roadmap and current progress.
- **FileTree:** Live view of the workspace, reflecting changes made by the agent immediately.

## Workflow
1. **User Prompt:** User provides a high-level goal.
2. **Analysis:** Gemini analyzes the prompt and identifies necessary steps.
3. **Loop:**
   - Agent generates a tool call.
   - Backend executes the tool and returns the result.
   - Agent evaluates the result and decides the next move.
4. **Completion:** Once the task is verified, the agent signals completion.
