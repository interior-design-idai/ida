"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: NextAuth integration
    console.log(isSignUp ? "Sign up" : "Sign in", { email, password, name });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-purple-500 mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            {isSignUp ? "建立帳號" : "歡迎回來"}
          </h1>
          <p className="text-muted mt-2">
            {isSignUp
              ? "開始創作，獲得 10 點免費額度"
              : "登入你的 IDAI 帳號"}
          </p>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-8">
          {/* Google OAuth */}
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-white/5 transition-colors mb-6">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-medium">使用 Google 繼續</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted uppercase">或</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-1.5">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的名字"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm transition-colors"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">電子郵件</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">密碼</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm transition-colors"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 !mt-6">
              {isSignUp ? "註冊" : "登入"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p className="text-center text-sm text-muted mt-6">
          {isSignUp ? "已有帳號？" : "還沒有帳號？"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-accent-light hover:underline font-medium"
          >
            {isSignUp ? "登入" : "註冊"}
          </button>
        </p>

        {/* Back to home */}
        <p className="text-center mt-4">
          <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">
            &larr; 返回首頁
          </Link>
        </p>
      </div>
    </div>
  );
}
