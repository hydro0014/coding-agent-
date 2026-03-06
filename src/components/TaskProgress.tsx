"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Task {
  id: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "error";
}

interface TaskProgressProps {
  tasks: Task[];
}

export default function TaskProgress({ tasks }: TaskProgressProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 w-full">
      <h3 className="text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wider">Plan & Progress</h3>
      <div className="space-y-3">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3"
            >
              {task.status === "completed" && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              {task.status === "in-progress" && (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
              )}
              {task.status === "pending" && (
                <Circle className="w-5 h-5 text-zinc-700 shrink-0" />
              )}
              {task.status === "error" && (
                <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0" />
              )}
              <span className={`text-sm ${
                task.status === "completed" ? "text-zinc-500 line-through" : "text-zinc-200"
              }`}>
                {task.description}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
