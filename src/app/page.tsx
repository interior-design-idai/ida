import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Image, Palette, Upload, Type } from "lucide-react";

const FEATURES = [
  {
    icon: Upload,
    title: "Sketch to Render",
    desc: "Upload hand-drawn sketches, get photorealistic renders in seconds.",
    credits: 2,
  },
  {
    icon: Image,
    title: "Realistic Render",
    desc: "Transform 3D models and line drawings into lifelike visualizations.",
    credits: 2,
  },
  {
    icon: Palette,
    title: "Photo Remodel",
    desc: "Upload existing photos with text descriptions to reimagine spaces.",
    credits: 3,
  },
  {
    icon: Sparkles,
    title: "Style Transfer",
    desc: "Switch between Modern, Wabi-sabi, Industrial, Classic with one click.",
    credits: 2,
  },
  {
    icon: Zap,
    title: "4K Upscale",
    desc: "Enhance low-resolution images to crisp 4K quality.",
    credits: 1,
  },
  {
    icon: Type,
    title: "Text to Design",
    desc: "Describe your vision in words, let AI generate the concept.",
    credits: 1,
  },
];

const SHOWCASE = [
  { before: "Sketch", after: "Photorealistic Render", gradient: "from-blue-500 to-cyan-500" },
  { before: "3D Wireframe", after: "Realistic Interior", gradient: "from-purple-500 to-pink-500" },
  { before: "Photo", after: "Redesigned Space", gradient: "from-amber-500 to-orange-500" },
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
              AI Render Platform
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
              It&apos;s just{" "}
              <span className="gradient-text">IDA</span>
              <span className="gradient-text">.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Transform sketches into photorealistic renders in seconds.
              Powered by AI, designed for architects and interior designers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/create" className="btn-primary text-base flex items-center gap-2">
                Start Creating
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/gallery" className="btn-secondary text-base">
                View Gallery
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 sm:gap-16 mt-16 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold">10</div>
                <div className="text-sm text-muted">Free Credits</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold">&lt;30s</div>
                <div className="text-sm text-muted">Per Render</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold">6</div>
                <div className="text-sm text-muted">AI Functions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">See the Difference</h2>
          <p className="text-muted text-lg">From concept to reality in one click</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {SHOWCASE.map((item, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden group hover:border-accent/50 transition-all">
              <div className={`h-48 bg-gradient-to-br ${item.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
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
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">6 Powerful AI Tools</h2>
          <p className="text-muted text-lg">Everything you need to bring designs to life</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 group hover:border-accent/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-accent-light" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted mb-4 leading-relaxed">{feature.desc}</p>
              <div className="flex items-center gap-1 text-xs text-accent-light">
                <Zap className="w-3 h-3" />
                {feature.credits} {feature.credits === 1 ? "credit" : "credits"}
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Create?</h2>
            <p className="text-muted text-lg mb-8 max-w-xl mx-auto">
              Sign up now and get 10 free credits. No credit card required.
            </p>
            <Link href="/login" className="btn-primary text-base inline-flex items-center gap-2">
              Get Started Free
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
              <span className="text-sm text-muted">AI Render Platform</span>
            </div>
            <p className="text-sm text-muted">&copy; 2026 IDA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
