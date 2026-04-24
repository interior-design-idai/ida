"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Zap,
  Type,
  ArrowRight,
  X,
  Download,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

const FUNCTIONS = [
  { id: "sketch2render", label: "Sketch to Render", icon: Upload, credits: 2, needsImage: true },
  { id: "realistic_render", label: "Realistic Render", icon: ImageIcon, credits: 2, needsImage: true },
  { id: "photo_remodel", label: "Photo Remodel", icon: Palette, credits: 3, needsImage: true },
  { id: "style_transfer", label: "Style Transfer", icon: Sparkles, credits: 2, needsImage: true },
  { id: "upscale", label: "4K Upscale", icon: Zap, credits: 1, needsImage: true },
  { id: "text2img", label: "Text to Design", icon: Type, credits: 1, needsImage: false },
];

const STYLES = [
  "Modern Minimalist",
  "Wabi-sabi",
  "Industrial",
  "Scandinavian",
  "Japanese Zen",
  "Art Deco",
  "Mid-Century Modern",
  "Contemporary Luxury",
];

const ROOMS = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Office",
  "Dining Room",
  "Lobby",
  "Commercial Space",
];

export default function CreatePage() {
  const [selectedFn, setSelectedFn] = useState(FUNCTIONS[0]);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [room, setRoom] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    // TODO: Call API
    await new Promise((r) => setTimeout(r, 3000));
    setResult("/placeholder-result.jpg");
    setGenerating(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Create</h1>
          <p className="text-sm text-muted mt-1">Transform your designs with AI</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-sm">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>10 credits</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr_320px] gap-6">
        {/* Left Panel - Function Selection */}
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-muted uppercase tracking-wider px-1 mb-3">
            AI Function
          </h2>
          {FUNCTIONS.map((fn) => (
            <button
              key={fn.id}
              onClick={() => {
                setSelectedFn(fn);
                setResult(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                selectedFn.id === fn.id
                  ? "bg-accent/10 border border-accent/30 text-foreground"
                  : "hover:bg-white/5 text-muted hover:text-foreground"
              }`}
            >
              <fn.icon className={`w-5 h-5 ${selectedFn.id === fn.id ? "text-accent-light" : ""}`} />
              <div className="flex-1">
                <div className="text-sm font-medium">{fn.label}</div>
              </div>
              <span className="flex items-center gap-0.5 text-xs text-yellow-500">
                <Zap className="w-3 h-3" />
                {fn.credits}
              </span>
            </button>
          ))}
        </div>

        {/* Center - Canvas */}
        <div className="space-y-6">
          {/* Upload / Input Area */}
          {selectedFn.needsImage && !uploadedImage && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="glass rounded-2xl border-2 border-dashed border-border hover:border-accent/50 transition-colors h-[400px] flex flex-col items-center justify-center cursor-pointer"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload className="w-12 h-12 text-muted mb-4" />
              <p className="text-muted mb-2">Drag & drop your image here</p>
              <p className="text-xs text-muted">or click to browse (PNG, JPG, WebP)</p>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Uploaded Image Preview */}
          {selectedFn.needsImage && uploadedImage && (
            <div className="relative glass rounded-2xl overflow-hidden">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-full h-[400px] object-contain bg-black/20"
              />
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setResult(null);
                }}
                className="absolute top-3 right-3 p-2 rounded-lg glass hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Text-only mode */}
          {!selectedFn.needsImage && (
            <div className="glass rounded-2xl h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Type className="w-16 h-16 text-accent-light/30 mx-auto mb-4" />
                <p className="text-muted">Enter your description in the prompt panel</p>
                <p className="text-xs text-muted mt-1">AI will generate a design from text</p>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="relative glass rounded-2xl overflow-hidden">
              <div className="w-full h-[400px] bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
                <p className="text-muted">Generated result will appear here</p>
              </div>
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button className="p-2 rounded-lg glass hover:bg-white/10" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="p-2 rounded-lg glass hover:bg-white/10"
                  title="Regenerate"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || (selectedFn.needsImage && !uploadedImage)}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate ({selectedFn.credits} credits)
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Prompt & Settings */}
        <div className="space-y-6">
          {/* Prompt */}
          <div>
            <h2 className="text-xs font-medium text-muted uppercase tracking-wider px-1 mb-3">
              Prompt
            </h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the design you want to create..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent focus:outline-none text-sm resize-none transition-colors"
            />
          </div>

          {/* Style */}
          <div>
            <h2 className="text-xs font-medium text-muted uppercase tracking-wider px-1 mb-3">
              Style
            </h2>
            <div className="relative">
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent focus:outline-none text-sm appearance-none cursor-pointer transition-colors"
              >
                <option value="">Select a style...</option>
                {STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>
          </div>

          {/* Room Type */}
          <div>
            <h2 className="text-xs font-medium text-muted uppercase tracking-wider px-1 mb-3">
              Room Type
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {ROOMS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRoom(room === r ? "" : r)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    room === r
                      ? "bg-accent/10 border border-accent/30 text-accent-light"
                      : "glass text-muted hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Prompts */}
          <div>
            <h2 className="text-xs font-medium text-muted uppercase tracking-wider px-1 mb-3">
              Quick Prompts
            </h2>
            <div className="space-y-2">
              {[
                "Modern minimalist living room, natural light, white oak floors",
                "Luxury bathroom, marble walls, freestanding tub, warm lighting",
                "Open kitchen with island, pendant lights, contemporary style",
              ].map((qp, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(qp)}
                  className="w-full text-left px-3 py-2 rounded-lg glass text-xs text-muted hover:text-foreground transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
