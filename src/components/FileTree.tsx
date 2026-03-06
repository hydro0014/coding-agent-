"use client";

import { useEffect, useState } from "react";
import { Folder, File, RefreshCw, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileItem {
  name: string;
  isDirectory: boolean;
  path: string;
  children?: FileItem[];
}

export default function FileTree() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // For simplicity, we just list the root. In a real app, this would be recursive or fetch on demand.
      const res = await fetch("/api/files");
      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error("Failed to fetch files", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (path: string) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderItem = (item: FileItem) => (
    <div key={item.path} className="select-none">
      <div
        className="flex items-center gap-2 py-1 px-2 hover:bg-zinc-800 rounded cursor-pointer text-sm text-zinc-300"
        onClick={() => item.isDirectory && toggleExpand(item.path)}
      >
        {item.isDirectory ? (
          <>
            {expanded[item.path] ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
            <Folder size={16} className="text-blue-400 fill-blue-400/20" />
          </>
        ) : (
          <>
            <div className="w-[14px]" />
            <File size={16} className="text-zinc-500" />
          </>
        )}
        <span>{item.name}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Explorer</h3>
        <button
          onClick={fetchFiles}
          className={`text-zinc-500 hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.map(renderItem)}
      </div>
    </div>
  );
}
