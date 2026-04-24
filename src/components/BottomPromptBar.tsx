"use client";

import { useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Upload, Wand2, Zap, Send } from "lucide-react";
import { PromptAssistant } from "./PromptAssistant";

export function BottomPromptBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [prompt, setPrompt] = useState("");
  const [showAssistant, setShowAssistant] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Don't show on create page (it has its own prompt area) or login page
  if (pathname === "/create" || pathname === "/login") return null;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    // Navigate to create page with prompt as query param
    router.push(`/create?prompt=${encodeURIComponent(prompt)}&fn=text2img`);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="描述你想要的設計，例如：現代極簡客廳，大面積落地窗..."
                className="w-full px-4 py-3 pr-24 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm resize-none transition-colors"
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                  onClick={() => setShowAssistant(true)}
                  className="p-1.5 text-muted hover:text-accent-light transition-colors"
                  title="提示詞助手"
                >
                  <Wand2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push("/create")}
                  className="p-1.5 text-muted hover:text-accent-light transition-colors"
                  title="上傳圖片"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="btn-primary !px-4 !py-3 flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">生圖</span>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
            {["現代客廳", "侘寂臥室", "工業風咖啡廳", "北歐書房", "日式禪風浴室"].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setPrompt(tag);
                  inputRef.current?.focus();
                }}
                className="px-3 py-1 rounded-full text-xs border border-border text-muted hover:text-foreground hover:border-accent/30 transition-colors whitespace-nowrap shrink-0"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <PromptAssistant
        isOpen={showAssistant}
        onClose={() => setShowAssistant(false)}
        onSelect={(p) => {
          setPrompt(p);
          inputRef.current?.focus();
        }}
      />
    </>
  );
}
