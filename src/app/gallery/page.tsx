"use client";

import { useState } from "react";
import { Search, Filter, Heart, Eye, Sparkles } from "lucide-react";

const CATEGORIES = ["全部", "室內設計", "建築", "景觀"];

const MOCK_GALLERY = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  prompt: [
    "Modern living room with floor-to-ceiling windows",
    "Minimalist bedroom with warm wood accents",
    "Industrial loft space with exposed brick",
    "Japanese zen garden courtyard",
    "Luxury penthouse panoramic view",
    "Scandinavian kitchen with natural light",
    "Wabi-sabi dining room earth tones",
    "Art deco hotel lobby golden accents",
    "Contemporary bathroom marble finish",
    "Mid-century modern office space",
    "Tropical resort villa interior",
    "Urban rooftop garden design",
  ][i],
  function: ["sketch2render", "text2img", "realistic_render", "style_transfer", "photo_remodel", "text2img"][i % 6],
  likes: Math.floor(Math.random() * 50) + 5,
  views: Math.floor(Math.random() * 200) + 20,
  gradient: [
    "from-blue-600 to-cyan-500",
    "from-purple-600 to-pink-500",
    "from-amber-600 to-orange-500",
    "from-emerald-600 to-teal-500",
    "from-rose-600 to-red-500",
    "from-indigo-600 to-violet-500",
  ][i % 6],
}));

export default function GalleryPage() {
  const [category, setCategory] = useState("全部");
  const [search, setSearch] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">作品展示</h1>
        <p className="text-muted text-lg">探索社群的 AI 生成設計</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋設計..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-accent focus:outline-none text-sm transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                category === cat
                  ? "bg-accent text-white"
                  : "glass text-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_GALLERY.map((item) => (
          <div
            key={item.id}
            className="glass rounded-2xl overflow-hidden group cursor-pointer hover:border-accent/30 transition-all"
          >
            {/* Image placeholder */}
            <div className={`relative h-56 bg-gradient-to-br ${item.gradient} opacity-30 group-hover:opacity-40 transition-opacity`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white/30" />
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-sm line-clamp-2 mb-3">{item.prompt}</p>
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
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent-light">
                  {item.function.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
