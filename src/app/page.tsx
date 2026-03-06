"use client";

import { useState } from "react";
import ChatInterface, { Message } from "@/components/ChatInterface";
import TaskProgress, { Task } from "@/components/TaskProgress";
import FileTree from "@/components/FileTree";
import { Terminal, Cpu, Layout, Settings } from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! I am your AI coding agent. What can I help you build today?" }
  ]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (prompt: string) => {
    setIsLoading(true);
    const newUserMessage: Message = { role: "user", content: prompt };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            handleAgentUpdate(data);
          } catch (e) {
            console.error("Error parsing SSE data", e);
          }
        }
      }
    } catch (error) {
      console.error("Error calling agent API", error);
      setMessages(prev => [...prev, { role: "bot", content: "Sorry, I encountered an error.", type: "error" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentUpdate = (data: any) => {
    switch (data.type) {
      case "thought":
        setMessages(prev => [...prev, { role: "bot", content: data.message, type: "thought" }]);
        // Try to extract tasks from thoughts if they look like a plan
        if (data.message.includes("1.") || data.message.includes("- [ ]")) {
           const lines = data.message.split("\n");
           const newTasks: Task[] = lines
            .filter((l: string) => /^\d+\.|\-\s\[\s\]/.test(l))
            .map((l: string, i: number) => ({
              id: `task-${Date.now()}-${i}`,
              description: l.replace(/^\d+\.|\-\s\[\s\]/, "").trim(),
              status: "pending"
            }));
           if (newTasks.length > 0) setTasks(newTasks);
        }
        break;
      case "tool_call":
        setMessages(prev => [...prev, { role: "bot", content: `Executing ${data.name}...`, type: "call", name: data.name }]);
        // Update first pending task to in-progress if we have tasks
        setTasks(prev => {
          const firstPending = prev.find(t => t.status === "pending");
          if (firstPending) {
            return prev.map(t => t.id === firstPending.id ? { ...t, status: "in-progress" } : t);
          }
          return prev;
        });
        break;
      case "tool_result":
        const resultStr = typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2);
        setMessages(prev => [...prev, { role: "bot", content: resultStr, type: "result", name: data.name }]);
        // Mark current in-progress task as completed
        setTasks(prev => {
           const inProgress = prev.find(t => t.status === "in-progress");
           if (inProgress) {
             return prev.map(t => t.id === inProgress.id ? { ...t, status: "completed" } : t);
           }
           return prev;
        });
        break;
      case "error":
        setMessages(prev => [...prev, { role: "bot", content: data.message, type: "error" }]);
        setTasks(prev => prev.map(t => t.status === "in-progress" ? { ...t, status: "error" } : t));
        break;
      case "done":
        setMessages(prev => [...prev, { role: "bot", content: data.message }]);
        setTasks(prev => prev.map(t => t.status === "pending" ? { ...t, status: "completed" } : t));
        break;
    }
  };

  return (
    <main className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-16 border-r border-zinc-800 flex flex-col items-center py-4 gap-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <Cpu size={24} />
        </div>
        <div className="flex flex-col gap-6 text-zinc-500">
          <Layout size={20} className="text-white cursor-pointer" />
          <Terminal size={20} className="hover:text-white cursor-pointer" />
          <Settings size={20} className="hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-800 flex items-center px-6 justify-between bg-zinc-950/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight">Gemini<span className="text-blue-500">Agent</span></span>
            <div className="bg-zinc-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-zinc-400">v2.0 Flash</div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs text-zinc-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                System Ready
             </div>
          </div>
        </header>

        <div className="flex-1 flex p-4 gap-4 overflow-hidden">
          {/* Left Column: Chat */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Status & Files */}
          <div className="w-80 flex flex-col gap-4 shrink-0">
            <TaskProgress tasks={tasks} />
            <div className="flex-1 min-h-0">
              <FileTree />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
