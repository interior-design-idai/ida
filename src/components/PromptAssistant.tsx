"use client";

import { useState } from "react";
import { Wand2, X, ChevronRight } from "lucide-react";

const PROMPT_CATEGORIES = [
  {
    name: "空間類型",
    items: [
      { label: "現代客廳", prompt: "現代極簡客廳，大面積落地窗，自然光線，白色沙發" },
      { label: "主臥套房", prompt: "溫馨主臥室，木質床頭牆，間接照明，米色調" },
      { label: "開放式廚房", prompt: "開放式廚房中島，大理石檯面，吊燈，木質地板" },
      { label: "Spa 浴室", prompt: "飯店風格浴室，獨立浴缸，石材牆面，玻璃淋浴間" },
      { label: "書房工作室", prompt: "北歐風格書房，整面書牆，大書桌，綠植" },
      { label: "餐廳", prompt: "現代餐廳，圓桌，設計師吊燈，酒櫃，藝術畫作" },
      { label: "玄關", prompt: "現代玄關，鞋櫃，穿衣鏡，端景牆，間接燈光" },
      { label: "商業空間", prompt: "精品咖啡廳，清水模牆面，木質吧台，工業風吊燈" },
    ],
  },
  {
    name: "設計風格",
    items: [
      { label: "現代極簡", prompt: "現代極簡風格，乾淨線條，白灰色調，隱藏收納" },
      { label: "侘寂", prompt: "侘寂風格，不完美之美，天然材質，低彩度，粗糙質感" },
      { label: "日式禪風", prompt: "日式禪風，木格柵，榻榻米，枯山水，自然光" },
      { label: "北歐風", prompt: "北歐斯堪地那維亞風格，淺木色，白牆，幾何軟裝" },
      { label: "工業風", prompt: "工業風格，裸露磚牆，金屬管線，水泥地板，鐵件家具" },
      { label: "輕奢", prompt: "輕奢風格，香檳金，大理石，絲絨材質，水晶燈" },
      { label: "新古典", prompt: "新古典風格，線板，水晶吊燈，對稱設計，典雅配色" },
      { label: "中世紀現代", prompt: "中世紀現代風格，有機曲線家具，暖木色，幾何圖案" },
    ],
  },
  {
    name: "材質氛圍",
    items: [
      { label: "大理石奢華", prompt: "大理石地板與牆面，金屬收邊，間接照明，高級感" },
      { label: "溫暖木質", prompt: "全室木質調，橡木地板，木格柵天花，溫暖燈光" },
      { label: "清水模", prompt: "清水模牆面，極簡家具，灰色調，自然光影" },
      { label: "自然綠意", prompt: "大量綠植，垂直花園，自然採光，木質家具" },
      { label: "暗色調奢華", prompt: "深色調空間，黑色大理石，金色點綴，戲劇性照明" },
      { label: "海濱度假", prompt: "海濱度假風，白色為主，藤編家具，淺藍配色" },
    ],
  },
  {
    name: "特殊效果",
    items: [
      { label: "夜景氛圍", prompt: "夜間氛圍照明，暖色調燈光，城市夜景窗外" },
      { label: "日光充足", prompt: "充足自然光線，大面積窗戶，光影變化，通透明亮" },
      { label: "雨天氛圍", prompt: "雨天窗外景色，溫馨室內燈光，舒適慵懶感" },
      { label: "建築攝影", prompt: "專業建築攝影風格，廣角鏡頭，完美構圖，雜誌級質感" },
      { label: "鳥瞰圖", prompt: "建築鳥瞰視角，整體規劃配置，景觀綠化，立體感" },
      { label: "手繪插畫", prompt: "水彩手繪風格插畫，柔和色調，藝術感" },
    ],
  },
];

interface PromptAssistantProps {
  onSelect: (prompt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function PromptAssistant({ onSelect, isOpen, onClose }: PromptAssistantProps) {
  const [activeCategory, setActiveCategory] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-accent-light" />
            <h2 className="text-lg font-bold">提示詞助手</h2>
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[60vh]">
          {/* Categories */}
          <div className="w-40 border-r border-border p-2 space-y-1 shrink-0">
            {PROMPT_CATEGORIES.map((cat, i) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(i)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeCategory === i
                    ? "bg-accent/10 text-accent-light font-medium"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              {PROMPT_CATEGORIES[activeCategory].items.map((item) => (
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

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border">
          <p className="text-xs text-muted">點選提示詞模板直接套用，或作為靈感參考修改</p>
        </div>
      </div>
    </div>
  );
}
