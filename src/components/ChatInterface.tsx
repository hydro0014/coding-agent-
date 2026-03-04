"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Terminal, User, Bot, Code, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Message {
  role: "user" | "bot" | "tool";
  content: string;
  type?: "thought" | "call" | "result" | "error";
  name?: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[85%] gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-zinc-800" : "bg-blue-600"
                }`}>
                  {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-zinc-800 text-zinc-100 rounded-tr-none"
                    : "bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none"
                }`}>
                  {m.type === "thought" && <div className="text-zinc-500 mb-1 text-xs uppercase font-bold flex items-center gap-1"><Terminal size={12}/> Thought</div>}
                  {m.type === "call" && <div className="text-blue-400 mb-1 text-xs uppercase font-bold flex items-center gap-1"><Code size={12}/> Calling {m.name}</div>}
                  {m.type === "result" && <div className="text-emerald-400 mb-1 text-xs uppercase font-bold flex items-center gap-1"><CheckCircle size={12}/> Tool Result</div>}
                  {m.type === "error" && <div className="text-red-400 mb-1 text-xs uppercase font-bold flex items-center gap-1"><AlertCircle size={12}/> Error</div>}

                  <div className="whitespace-pre-wrap font-mono text-[13px]">
                    {m.content}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
                <Bot size={16} />
             </div>
             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-2">
                <div className="flex gap-1">
                   <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                   <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                   <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command or task..."
            disabled={isLoading}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

function CheckCircle({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}
