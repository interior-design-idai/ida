"use client";

import { useState } from "react";
import { Wand2, X, ChevronRight, Shuffle, Sparkles } from "lucide-react";

const SPACES = [
  "客廳", "臥室", "主臥", "廚房", "浴室", "書房",
  "餐廳", "玄關", "陽台", "辦公室", "會議室", "咖啡廳",
  "大廳", "展示間", "商業空間",
];

const STYLES = [
  "現代極簡", "侘寂", "日式禪風", "北歐風", "工業風",
  "輕奢", "新古典", "中世紀現代", "Art Deco", "鄉村風",
  "地中海風", "波西米亞", "當代奢華",
];

const MATERIALS = [
  "大理石", "木質", "清水模", "磁磚", "石材",
  "皮革", "不鏽鋼", "黃銅", "藤編", "玻璃",
];

const MOODS = [
  "自然採光", "暖色燈光", "夜景氛圍", "明亮通透",
  "溫馨舒適", "高級質感", "戲劇性照明", "柔和日光",
];

const DETAILS = [
  "落地窗", "中島吧台", "電視牆", "書牆", "獨立浴缸",
  "壁爐", "樓梯", "挑高天花", "綠植", "藝術畫作",
  "設計師吊燈", "地毯", "窗簾",
];

const PROMPT_TEMPLATES = [
  {
    name: "空間類型",
    items: [
      { label: "現代客廳", prompt: "現代極簡客廳，大面積落地窗，自然光線，白色沙發，木質地板" },
      { label: "主臥套房", prompt: "溫馨主臥室，木質床頭牆，間接照明，米色調，大面積地毯" },
      { label: "開放式廚房", prompt: "開放式廚房中島，大理石檯面，吊燈，木質地板，高級廚具" },
      { label: "Spa 浴室", prompt: "飯店風格浴室，獨立浴缸，石材牆面，玻璃淋浴間，間接燈光" },
      { label: "書房工作室", prompt: "北歐風格書房，整面書牆，大書桌，綠植，自然光" },
      { label: "商業咖啡廳", prompt: "精品咖啡廳，清水模牆面，木質吧台，工業風吊燈，綠植裝飾" },
    ],
  },
  {
    name: "設計風格",
    items: [
      { label: "現代極簡", prompt: "現代極簡風格，乾淨線條，白灰色調，隱藏收納，大面積留白" },
      { label: "侘寂", prompt: "侘寂風格，不完美之美，天然材質，低彩度，粗糙質感，手作陶器" },
      { label: "日式禪風", prompt: "日式禪風，木格柵，榻榻米，枯山水，自然光，竹簾" },
      { label: "工業風", prompt: "工業風格，裸露磚牆，金屬管線，水泥地板，鐵件家具，Edison燈泡" },
      { label: "輕奢", prompt: "輕奢風格，香檳金，大理石，絲絨材質，水晶燈，鏡面裝飾" },
      { label: "北歐風", prompt: "北歐斯堪地那維亞風格，淺木色，白牆，幾何軟裝，毛毯，溫暖燈光" },
    ],
  },
  {
    name: "特殊效果",
    items: [
      { label: "夜景氛圍", prompt: "夜間氛圍照明，暖色調燈光，城市夜景窗外，高級感" },
      { label: "建築攝影", prompt: "專業建築攝影風格，廣角鏡頭，完美構圖，雜誌級質感" },
      { label: "鳥瞰圖", prompt: "建築鳥瞰視角，整體規劃配置，景觀綠化，立體感" },
      { label: "手繪插畫", prompt: "水彩手繪風格插畫，柔和色調，藝術感，設計草圖" },
      { label: "材質特寫", prompt: "材質細節特寫，紋理質感，高解析度，微距攝影風格" },
      { label: "陽光灑落", prompt: "充足自然光線，光影交錯，陽光從窗戶灑入，溫暖氛圍" },
    ],
  },
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSmartPrompt(): string {
  const space = randomPick(SPACES);
  const style = randomPick(STYLES);
  const material = randomPick(MATERIALS);
  const mood = randomPick(MOODS);
  const detail1 = randomPick(DETAILS);
  const detail2 = randomPick(DETAILS.filter((d) => d !== detail1));
  return `${style}風格${space}，${material}材質，${detail1}，${detail2}，${mood}，專業室內設計攝影，8K高清`;
}

interface PromptAssistantProps {
  onSelect: (prompt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function PromptAssistant({ onSelect, isOpen, onClose }: PromptAssistantProps) {
  const [activeTab, setActiveTab] = useState<"smart" | "templates">("smart");
  const [selectedSpace, setSelectedSpace] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);
  const [templateCategory, setTemplateCategory] = useState(0);

  if (!isOpen) return null;

  const buildPrompt = () => {
    const parts = [];
    if (selectedStyle) parts.push(`${selectedStyle}風格`);
    if (selectedSpace) parts.push(selectedSpace);
    if (selectedMaterial) parts.push(`${selectedMaterial}材質`);
    if (selectedDetails.length > 0) parts.push(selectedDetails.join("，"));
    if (selectedMood) parts.push(selectedMood);
    parts.push("專業室內設計攝影，8K高清");
    return parts.join("，");
  };

  const toggleDetail = (d: string) => {
    setSelectedDetails((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : prev.length < 3 ? [...prev, d] : prev
    );
  };

  const handleRandomGenerate = () => {
    const prompt = generateSmartPrompt();
    onSelect(prompt);
    onClose();
  };

  const handleBuildAndSelect = () => {
    const prompt = buildPrompt();
    onSelect(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass w-full max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-accent-light" />
            <h2 className="text-lg font-bold">提示詞助手</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("smart")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "smart" ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
            >
              智慧組合
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "templates" ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
            >
              範本
            </button>
            <button onClick={onClose} className="p-1 text-muted hover:text-foreground ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === "smart" ? (
          <div className="overflow-y-auto p-6 max-h-[65vh]">
            {/* Random Generate */}
            <button
              onClick={handleRandomGenerate}
              className="w-full flex items-center justify-center gap-2 mb-6 px-4 py-3 rounded-xl bg-gradient-to-r from-accent/20 to-purple-500/20 border border-accent/30 text-accent-light hover:from-accent/30 hover:to-purple-500/30 transition-all"
            >
              <Shuffle className="w-4 h-4" />
              隨機生成提示詞
            </button>

            {/* Space */}
            <div className="mb-5">
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">空間類型</h3>
              <div className="flex flex-wrap gap-2">
                {SPACES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSpace(selectedSpace === s ? "" : s)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      selectedSpace === s
                        ? "bg-accent/10 border border-accent/30 text-accent-light"
                        : "border border-border text-muted hover:text-foreground hover:border-accent/20"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="mb-5">
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">設計風格</h3>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStyle(selectedStyle === s ? "" : s)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      selectedStyle === s
                        ? "bg-accent/10 border border-accent/30 text-accent-light"
                        : "border border-border text-muted hover:text-foreground hover:border-accent/20"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Material */}
            <div className="mb-5">
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">主要材質</h3>
              <div className="flex flex-wrap gap-2">
                {MATERIALS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMaterial(selectedMaterial === m ? "" : m)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      selectedMaterial === m
                        ? "bg-accent/10 border border-accent/30 text-accent-light"
                        : "border border-border text-muted hover:text-foreground hover:border-accent/20"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div className="mb-5">
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">光線氛圍</h3>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMood(selectedMood === m ? "" : m)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      selectedMood === m
                        ? "bg-accent/10 border border-accent/30 text-accent-light"
                        : "border border-border text-muted hover:text-foreground hover:border-accent/20"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="mb-5">
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">細節元素（最多 3 個）</h3>
              <div className="flex flex-wrap gap-2">
                {DETAILS.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDetail(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      selectedDetails.includes(d)
                        ? "bg-accent/10 border border-accent/30 text-accent-light"
                        : "border border-border text-muted hover:text-foreground hover:border-accent/20"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview & Apply */}
            <div className="sticky bottom-0 bg-background/80 backdrop-blur pt-4 border-t border-border">
              <div className="text-xs text-muted mb-2">預覽：</div>
              <div className="text-sm mb-3 min-h-[2rem]">{buildPrompt()}</div>
              <button
                onClick={handleBuildAndSelect}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                套用此提示詞
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-[65vh]">
            {/* Template Categories */}
            <div className="w-36 border-r border-border p-2 space-y-1 shrink-0">
              {PROMPT_TEMPLATES.map((cat, i) => (
                <button
                  key={cat.name}
                  onClick={() => setTemplateCategory(i)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    templateCategory === i
                      ? "bg-accent/10 text-accent-light font-medium"
                      : "text-muted hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Template Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {PROMPT_TEMPLATES[templateCategory].items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      onSelect(item.prompt);
                      onClose();
                    }}
                    className="group text-left p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted line-clamp-2">{item.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
