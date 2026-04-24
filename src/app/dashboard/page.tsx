"use client";

import Link from "next/link";
import { Zap, Clock, ArrowRight, Plus, Image, TrendingUp } from "lucide-react";

const MOCK_HISTORY = [
  { id: 1, type: "sketch2render", prompt: "Modern living room with large windows...", createdAt: "2 分鐘前", credits: 2 },
  { id: 2, type: "text2img", prompt: "Minimalist bedroom, warm lighting, wood...", createdAt: "1 小時前", credits: 1 },
  { id: 3, type: "style_transfer", prompt: "Wabi-sabi style conversion", createdAt: "3 小時前", credits: 2 },
  { id: 4, type: "upscale", prompt: "4K upscale — kitchen render", createdAt: "昨天", credits: 1 },
];

const FUNCTION_LABELS: Record<string, string> = {
  sketch2render: "草圖轉渲染",
  text2img: "文字生圖",
  style_transfer: "風格轉換",
  upscale: "4K 放大",
  realistic_render: "寫實渲染",
  photo_remodel: "照片改造",
};

export default function DashboardPage() {
  const credits = 10;
  const totalGenerated = 24;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold">儀表板</h1>
          <p className="text-muted mt-1">歡迎回來！這是你的概覽。</p>
        </div>
        <Link href="/create" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          新增創作
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-sm text-muted">點數餘額</span>
          </div>
          <div className="text-3xl font-bold">{credits}</div>
          <Link href="/pricing" className="text-xs text-accent-light hover:underline mt-2 inline-block">
            購買更多點數 &rarr;
          </Link>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Image className="w-5 h-5 text-accent-light" />
            </div>
            <span className="text-sm text-muted">總生成數</span>
          </div>
          <div className="text-3xl font-bold">{totalGenerated}</div>
          <span className="text-xs text-muted mt-2 inline-block">累計</span>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted">本月</span>
          </div>
          <div className="text-3xl font-bold">12</div>
          <span className="text-xs text-green-400 mt-2 inline-block">較上月 +33%</span>
        </div>
      </div>

      {/* Recent History */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold">最近的創作</h2>
          <Link href="/gallery" className="text-sm text-accent-light hover:underline flex items-center gap-1">
            查看全部 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-border">
          {MOCK_HISTORY.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
              {/* Thumbnail placeholder */}
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Image className="w-5 h-5 text-accent-light" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-light">
                    {FUNCTION_LABELS[item.type] || item.type}
                  </span>
                </div>
                <p className="text-sm text-muted truncate">{item.prompt}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Clock className="w-3 h-3" />
                  {item.createdAt}
                </div>
                <div className="flex items-center gap-1 text-xs text-yellow-500 mt-1">
                  <Zap className="w-3 h-3" />
                  {item.credits} 點
                </div>
              </div>
            </div>
          ))}
        </div>

        {MOCK_HISTORY.length === 0 && (
          <div className="text-center py-16">
            <Image className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted mb-4">尚無創作</p>
            <Link href="/create" className="btn-primary text-sm">
              建立你的第一張渲染
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
