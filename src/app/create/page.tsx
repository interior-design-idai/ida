"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  AlertCircle,
  CheckCircle2,
  Loader2,
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

const PROGRESS_MESSAGES = [
  "Analyzing your input...",
  "Building AI workflow...",
  "Generating design concepts...",
  "Rendering photorealistic details...",
  "Applying style refinements...",
  "Enhancing lighting and textures...",
  "Finalizing high-resolution output...",
];

// Extract the raw base64 data from a data URL (strip the data:image/...;base64, prefix)
function dataUrlToBase64(dataUrl: string): string {
  const idx = dataUrl.indexOf(",");
  return idx >= 0 ? dataUrl.substring(idx + 1) : dataUrl;
}

export default function CreatePage() {
  const [selectedFn, setSelectedFn] = useState(FUNCTIONS[0]);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [room, setRoom] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [progressIdx, setProgressIdx] = useState(0);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cycle through progress messages during generation
  useEffect(() => {
    if (generating) {
      setProgressIdx(0);
      progressTimer.current = setInterval(() => {
        setProgressIdx((prev) =>
          prev < PROGRESS_MESSAGES.length - 1 ? prev + 1 : prev
        );
      }, 4000);
    } else {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
        progressTimer.current = null;
      }
    }
    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, [generating]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    // Validate inputs
    if (selectedFn.needsImage && !uploadedImage) {
      setError("Please upload an image first.");
      return;
    }
    if (selectedFn.id === "text2img" && !prompt.trim()) {
      setError("Please enter a description for the design you want to create.");
      return;
    }

    setGenerating(true);
    setError(null);
    setResult(null);
    setGenerationTime(null);

    const startTime = Date.now();
    abortControllerRef.current = new AbortController();

    try {
      // Build the request body for the primary API
      const requestBody: Record<string, unknown> = {
        userId: "demo-user", // In production, get from auth context
        functionType: selectedFn.id,
        prompt: prompt.trim() || undefined,
        style: style || undefined,
        roomType: room || undefined,
      };

      // If the function needs an image, send both formats:
      // imageBase64 for ComfyUI (raw base64), imageUrl for fal.ai (data URI)
      if (selectedFn.needsImage && uploadedImage) {
        requestBody.imageBase64 = dataUrlToBase64(uploadedImage);
        requestBody.imageUrl = uploadedImage; // data URI for fal.ai fallback
      }

      // Try the primary generate endpoint first
      let response: Response;
      let data: {
        success?: boolean;
        outputUrl?: string;
        creditsUsed?: number;
        creditsRemaining?: number;
        error?: string;
        required?: number;
        seed?: number;
        engine?: string;
      };

      try {
        response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        });
        data = await response.json();
      } catch (primaryError) {
        // If the primary endpoint fails (e.g., no Supabase/RunPod configured),
        // fallback to the test-generate endpoint (fal.ai)
        if (abortControllerRef.current.signal.aborted) throw primaryError;

        console.warn("Primary API failed, trying test-generate fallback:", primaryError);

        const fallbackBody: Record<string, unknown> = {
          functionType: selectedFn.id,
          prompt: prompt.trim() || undefined,
          style: style || undefined,
          roomType: room || undefined,
        };
        if (selectedFn.needsImage && uploadedImage) {
          fallbackBody.imageUrl = uploadedImage;
        }

        response = await fetch("/api/test-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fallbackBody),
          signal: abortControllerRef.current.signal,
        });
        data = await response.json();
      }

      if (!response.ok || !data.success) {
        // Handle specific error codes
        if (response.status === 402) {
          setError(
            `Insufficient credits. This function requires ${data.required || selectedFn.credits} credits. Please purchase more credits.`
          );
        } else if (response.status === 400) {
          setError(data.error || "Invalid request. Please check your inputs.");
        } else {
          setError(data.error || "Generation failed. Please try again.");
        }
        return;
      }

      // Success
      const outputUrl = data.outputUrl;
      if (!outputUrl) {
        setError("No image was returned. Please try again.");
        return;
      }

      // Determine if output is base64 or URL
      // If it's raw base64 (from ComfyUI), convert to data URI for display
      let displayUrl: string;
      if (outputUrl.startsWith("data:") || outputUrl.startsWith("http")) {
        displayUrl = outputUrl;
      } else {
        // Assume raw base64, wrap as data URI
        displayUrl = `data:image/png;base64,${outputUrl}`;
      }

      setResult(displayUrl);
      setGenerationTime(Math.round((Date.now() - startTime) / 1000));

      if (data.creditsRemaining !== undefined) {
        setCreditsRemaining(data.creditsRemaining);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User cancelled, no error to show
        return;
      }
      console.error("Generation error:", err);
      setError(
        err instanceof Error
          ? `Generation failed: ${err.message}`
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const link = document.createElement("a");
    link.href = result;

    // Generate meaningful filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
    const fnLabel = selectedFn.id.replace(/_/g, "-");
    link.download = `ida-${fnLabel}-${timestamp}.png`;

    // For URLs (not data URIs), we need to fetch and create a blob
    if (result.startsWith("http")) {
      fetch(result)
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          link.href = blobUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        })
        .catch(() => {
          // Fallback: open in new tab
          window.open(result, "_blank");
        });
    } else {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setGenerating(false);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setGenerationTime(null);
  };

  const canGenerate =
    !generating &&
    (selectedFn.needsImage ? !!uploadedImage : !!prompt.trim());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Create</h1>
          <p className="text-sm text-muted mt-1">Transform your designs with AI</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-sm">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>
            {creditsRemaining !== null ? creditsRemaining : 10} credits
          </span>
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
                setError(null);
                setGenerationTime(null);
              }}
              disabled={generating}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                selectedFn.id === fn.id
                  ? "bg-accent/10 border border-accent/30 text-foreground"
                  : "hover:bg-white/5 text-muted hover:text-foreground"
              } ${generating ? "opacity-50 cursor-not-allowed" : ""}`}
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
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-300">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Generation Progress Overlay */}
          {generating && (
            <div className="glass rounded-2xl overflow-hidden h-[400px] flex flex-col items-center justify-center relative">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-purple-500/5 to-accent/5" style={{ backgroundSize: "400% 400%", animation: "gradient-shift 6s ease infinite" }} />

              <div className="relative z-10 flex flex-col items-center">
                {/* Spinner */}
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-full border-2 border-accent/20" />
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-t-accent-light animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-accent-light animate-pulse" />
                  </div>
                </div>

                {/* Progress text */}
                <p className="text-foreground font-medium mb-2">
                  {PROGRESS_MESSAGES[progressIdx]}
                </p>
                <p className="text-xs text-muted">
                  This usually takes 15-60 seconds
                </p>

                {/* Progress bar */}
                <div className="w-64 h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(((progressIdx + 1) / PROGRESS_MESSAGES.length) * 100, 95)}%`,
                    }}
                  />
                </div>

                {/* Cancel button */}
                <button
                  onClick={handleCancel}
                  className="mt-6 px-4 py-2 text-xs text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Upload / Input Area */}
          {!generating && selectedFn.needsImage && !uploadedImage && !result && (
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
          {!generating && selectedFn.needsImage && uploadedImage && !result && (
            <div className="relative glass rounded-2xl overflow-hidden">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-full h-[400px] object-contain bg-black/20"
              />
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg glass text-xs text-muted">
                {uploadedFileName || "Uploaded image"}
              </div>
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setUploadedFileName("");
                  setResult(null);
                  setError(null);
                }}
                className="absolute top-3 right-3 p-2 rounded-lg glass hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Text-only mode */}
          {!generating && !selectedFn.needsImage && !result && (
            <div className="glass rounded-2xl h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Type className="w-16 h-16 text-accent-light/30 mx-auto mb-4" />
                <p className="text-muted">Enter your description in the prompt panel</p>
                <p className="text-xs text-muted mt-1">AI will generate a design from text</p>
              </div>
            </div>
          )}

          {/* Result */}
          {!generating && result && (
            <div className="relative glass rounded-2xl overflow-hidden">
              <img
                src={result}
                alt="Generated result"
                className="w-full h-[400px] object-contain bg-black/20"
              />
              {/* Success banner */}
              <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-green-300">
                  Generated{generationTime ? ` in ${generationTime}s` : ""}
                </span>
                {creditsRemaining !== null && (
                  <span className="text-muted ml-1">
                    | {creditsRemaining} credits left
                  </span>
                )}
              </div>
              {/* Action buttons */}
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg glass hover:bg-white/10 text-sm transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg glass hover:bg-white/10 text-sm transition-colors"
                  title="Generate again"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">New</span>
                </button>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {!result && (
            <button
              onClick={generating ? handleCancel : handleGenerate}
              disabled={!generating && !canGenerate}
              className={`w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                generating
                  ? "btn-secondary"
                  : "btn-primary"
              }`}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating... Click to cancel
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate ({selectedFn.credits} credits)
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {/* Post-generation actions */}
          {result && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setResult(null);
                  setError(null);
                  setGenerationTime(null);
                  handleGenerate();
                }}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Regenerate ({selectedFn.credits} credits)
              </button>
              <button
                onClick={handleDownload}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Result
              </button>
            </div>
          )}
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
              disabled={generating}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent focus:outline-none text-sm resize-none transition-colors disabled:opacity-50"
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
                disabled={generating}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent focus:outline-none text-sm appearance-none cursor-pointer transition-colors disabled:opacity-50"
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
                  disabled={generating}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    room === r
                      ? "bg-accent/10 border border-accent/30 text-accent-light"
                      : "glass text-muted hover:text-foreground"
                  } ${generating ? "opacity-50 cursor-not-allowed" : ""}`}
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
                  disabled={generating}
                  className="w-full text-left px-3 py-2 rounded-lg glass text-xs text-muted hover:text-foreground transition-colors disabled:opacity-50"
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
