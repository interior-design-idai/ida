"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Heart, Eye, Pencil, ImageIcon, Wand2, SunMedium, Maximize, Type, Search } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "推薦" },
  { id: "interior", label: "室內設計" },
  { id: "luxury", label: "輕奢" },
  { id: "illustration", label: "插畫" },
  { id: "minimal", label: "極簡" },
  { id: "tech", label: "科技" },
  { id: "architecture", label: "建築設計" },
  { id: "landscape", label: "景觀設計" },
];

const GALLERY_ITEMS = [
  { image: "/showcase-1.jpg", title: "現代極簡客廳", category: "interior", likes: 128, views: 1420 },
  { image: "/style-luxury1.jpg", title: "香檳金輕奢客廳", category: "luxury", likes: 246, views: 2340 },
  { image: "/feature-2.jpg", title: "開放式生活空間", category: "interior", likes: 96, views: 890 },
  { image: "/style-illust1.jpg", title: "水彩風格客廳插畫", category: "illustration", likes: 312, views: 2780 },
  { image: "/showcase-2.jpg", title: "奢華主臥套房", category: "interior", likes: 215, views: 2100 },
  { image: "/style-tech1.jpg", title: "未來科技智慧宅", category: "tech", likes: 189, views: 1720 },
  { image: "/style-minimal1.jpg", title: "極簡白色臥室", category: "minimal", likes: 156, views: 1380 },
  { image: "/feature-4.jpg", title: "侘寂風格起居室", category: "interior", likes: 184, views: 1650 },
  { image: "/style-luxury2.jpg", title: "輕奢風格餐廳", category: "luxury", likes: 198, views: 1850 },
  { image: "/feature-3.jpg", title: "Spa 風格浴室", category: "interior", likes: 142, views: 1280 },
  { image: "/style-illust2.jpg", title: "現代廚房概念插畫", category: "illustration", likes: 267, views: 2450 },
  { image: "/style-tech2.jpg", title: "科技感辦公空間", category: "tech", likes: 174, views: 1560 },
  { image: "/showcase-3.jpg", title: "現代開放式廚房", category: "interior", likes: 167, views: 1520 },
  { image: "/style-minimal2.jpg", title: "極簡清水模浴室", category: "minimal", likes: 134, views: 1190 },
  { image: "/feature-6.jpg", title: "北歐風格書房", category: "interior", likes: 89, views: 780 },
  { image: "/feature-1.jpg", title: "草圖轉寫實渲染", category: "interior", likes: 203, views: 1890 },
  { image: "/feature-5.jpg", title: "材質細節特寫", category: "interior", likes: 76, views: 650 },
];

const FEATURE_CARDS = [
  {
    icon: Pencil,
    title: "草圖變照片",
    desc: "快速驗證設計意圖",
    credits: 2,
    image: "/feature-1.jpg",
    fn: "sketch2render",
  },
  {
    icon: ImageIcon,
    title: "一鍵寫實渲染",
    desc: "極致還原，重塑物理美學",
    credits: 2,
    image: "/feature-2.jpg",
    fn: "realistic_render",
  },
  {
    icon: Wand2,
    title: "照片改造",
    desc: "即時成像，改造神器",
    credits: 3,
    image: "/feature-3.jpg",
    fn: "photo_remodel",
  },
  {
    icon: SunMedium,
    title: "風格轉換",
    desc: "一鍵切換設計風格",
    credits: 2,
    image: "/feature-4.jpg",
    fn: "style_transfer",
  },
  {
    icon: Maximize,
    title: "4K 放大",
    desc: "AI 超解析度放大",
    credits: 1,
    image: "/feature-5.jpg",
    fn: "upscale",
  },
  {
    icon: Type,
    title: "文字生圖",
    desc: "描述你的設計，AI 生成",
    credits: 1,
    image: "/feature-6.jpg",
    fn: "text2img",
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    const matchCategory = activeCategory === "all" || item.category === activeCategory;
    const matchSearch = !searchQuery || item.title.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent/10 via-purple-500/10 to-accent/10 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-accent-light" />
              <span className="text-sm">
                <strong>It&apos;s just IDAI.</strong> — 幾秒內將草圖轉為寫實渲染，免費開始使用
              </span>
            </div>
            <Link href="/create" className="btn-primary text-xs !px-4 !py-1.5 hidden sm:inline-flex items-center gap-1">
              開始創作 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋作品、風格、空間類型..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/50 border border-border focus:border-accent focus:outline-none text-sm transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {FEATURE_CARDS.map((card) => (
            <Link
              key={card.fn}
              href={`/create?fn=${card.fn}`}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-all shrink-0"
            >
              <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium">{card.title}</h4>
                <p className="text-xs text-muted">{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-border sticky top-16 z-10 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filteredItems.map((item, i) => (
            <div
              key={i}
              className="break-inside-avoid glass rounded-2xl overflow-hidden group cursor-pointer hover:border-accent/30 transition-all"
            >
              <div className="overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{ minHeight: i % 3 === 0 ? "280px" : i % 3 === 1 ? "200px" : "240px" }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium mb-2">{item.title}</h3>
                <div className="flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {item.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {item.views}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent-light text-xs">
                    AI 生成
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold">IDAI</span>
              <span className="text-sm text-muted">AI 渲染平台</span>
            </div>
            <p className="text-sm text-muted">&copy; 2026 IDAI. 保留所有權利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
