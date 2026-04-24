import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Image, Palette, Upload, Type } from "lucide-react";

const FEATURES = [
  {
    icon: Upload,
    title: "草圖轉渲染",
    desc: "上傳手繪草圖，幾秒內獲得寫實渲染圖。",
    credits: 2,
  },
  {
    icon: Image,
    title: "寫實渲染",
    desc: "將 3D 模型和線稿轉化為逼真的視覺效果。",
    credits: 2,
  },
  {
    icon: Palette,
    title: "照片改造",
    desc: "上傳現有照片並輸入文字描述，重新想像空間。",
    credits: 3,
  },
  {
    icon: Sparkles,
    title: "風格轉換",
    desc: "一鍵切換現代、侘寂、工業、古典等風格。",
    credits: 2,
  },
  {
    icon: Zap,
    title: "4K 放大",
    desc: "將低解析度圖片提升至清晰的 4K 品質。",
    credits: 1,
  },
  {
    icon: Type,
    title: "文字生圖",
    desc: "用文字描述你的願景，讓 AI 生成設計概念。",
    credits: 1,
  },
];

const SHOWCASE = [
  { before: "草圖", after: "寫實渲染", image: "/showcase-1.jpg" },
  { before: "3D 線稿", after: "寫實室內", image: "/showcase-2.jpg" },
  { before: "照片", after: "重新設計空間", image: "/showcase-3.jpg" },
];

const FEATURE_IMAGES = [
  "/feature-1.jpg",
  "/feature-2.jpg",
  "/feature-3.jpg",
  "/feature-4.jpg",
  "/feature-5.jpg",
  "/feature-6.jpg",
];

export default function Home() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted mb-8">
              <Sparkles className="w-4 h-4 text-accent-light" />
              AI 渲染平台
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
              It&apos;s just{" "}
              <span className="gradient-text">IDA</span>
              <span className="gradient-text">.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              幾秒內將草圖轉化為寫實渲染圖。
              由 AI 驅動，專為建築師與室內設計師打造。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/create" className="btn-primary text-base flex items-center gap-2">
                開始創作
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/gallery" className="btn-secondary text-base">
                瀏覽作品
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 sm:gap-16 mt-16 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold">10</div>
                <div className="text-sm text-muted">免費點數</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold">&lt;30s</div>
                <div className="text-sm text-muted">每張渲染</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold">6</div>
                <div className="text-sm text-muted">AI 功能</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">看見差異</h2>
          <p className="text-muted text-lg">一鍵從概念到現實</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {SHOWCASE.map((item, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden group hover:border-accent/50 transition-all">
              <div className="h-48 overflow-hidden">
                <img src={item.image} alt={item.after} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-muted">{item.before}</span>
                  <ArrowRight className="w-4 h-4 text-accent-light" />
                  <span className="text-sm font-medium">{item.after}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">6 大 AI 工具</h2>
          <p className="text-muted text-lg">你需要的一切，讓設計栩栩如生</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="glass rounded-2xl overflow-hidden group hover:border-accent/50 transition-all"
            >
              <div className="h-40 overflow-hidden">
                <img src={FEATURE_IMAGES[i]} alt={feature.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-accent-light" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted mb-4 leading-relaxed">{feature.desc}</p>
                <div className="flex items-center gap-1 text-xs text-accent-light">
                  <Zap className="w-3 h-3" />
                  {feature.credits} 點
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-purple-500/5 to-transparent" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">準備好了嗎？</h2>
            <p className="text-muted text-lg mb-8 max-w-xl mx-auto">
              立即註冊，獲得 10 點免費額度。無需信用卡。
            </p>
            <Link href="/login" className="btn-primary text-base inline-flex items-center gap-2">
              免費開始
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold">IDA</span>
              <span className="text-sm text-muted">AI 渲染平台</span>
            </div>
            <p className="text-sm text-muted">&copy; 2026 IDA. 保留所有權利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
