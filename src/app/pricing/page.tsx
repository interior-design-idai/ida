"use client";

import { useState, useRef } from "react";
import { Check, Zap, Sparkles, Star, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";

const CREDIT_PACKS = [
  { id: "pack_50", credits: 50, price: 199, perCredit: 3.98 },
  { id: "pack_150", credits: 150, price: 499, perCredit: 3.33, popular: true },
  { id: "pack_500", credits: 500, price: 1499, perCredit: 3.0 },
];

const SUBSCRIPTIONS = [
  {
    name: "基本版",
    price: 299,
    credits: 100,
    features: ["每月 100 點", "全部 6 種 AI 工具", "標準解析度", "電子郵件支援"],
  },
  {
    name: "專業版",
    price: 799,
    credits: 500,
    popular: true,
    features: ["每月 500 點", "全部 6 種 AI 工具", "4K 解析度", "優先支援", "私人作品集"],
  },
  {
    name: "事務所版",
    price: 2999,
    credits: 2000,
    features: ["每月 2,000 點", "全部 6 種 AI 工具", "4K 解析度", "專屬支援", "團隊帳號", "API 存取"],
  },
];

export default function PricingPage() {
  const [tab, setTab] = useState<"packs" | "subscription">("packs");
  const [loading, setLoading] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handlePurchase = async (packId: string) => {
    setLoading(packId);

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }

      // Create ECPay order
      const res = await fetch("/api/ecpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId, userId: session.user.id }),
      });

      const { formData, paymentURL } = await res.json();

      if (!res.ok) {
        alert("建立訂單失敗，請稍後再試");
        return;
      }

      // Create hidden form and submit to ECPay
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentURL;
      form.style.display = "none";

      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch {
      alert("發生錯誤，請稍後再試");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">簡單定價</h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          按次付費或月訂閱。新用戶贈送 10 點免費額度。
        </p>
        <p className="text-muted text-sm mt-2">
          支援信用卡、ATM 轉帳、超商代碼繳費
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 mb-12">
        <button
          onClick={() => setTab("packs")}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === "packs" ? "bg-accent text-white" : "glass text-muted hover:text-foreground"
          }`}
        >
          點數包
        </button>
        <button
          onClick={() => setTab("subscription")}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === "subscription" ? "bg-accent text-white" : "glass text-muted hover:text-foreground"
          }`}
        >
          月訂閱方案
        </button>
      </div>

      {/* Credit Packs */}
      {tab === "packs" && (
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.credits}
              className={`glass rounded-2xl p-8 text-center relative ${
                pack.popular ? "border-accent/50 ring-1 ring-accent/20" : ""
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-white text-xs font-medium">
                  最超值
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="text-4xl font-bold mb-1">{pack.credits}</div>
              <div className="text-sm text-muted mb-6">點</div>
              <div className="text-3xl font-bold mb-1">
                NT${pack.price.toLocaleString()}
              </div>
              <div className="text-xs text-muted mb-6">
                每點 NT${pack.perCredit.toFixed(2)}
              </div>
              <button
                onClick={() => handlePurchase(pack.id)}
                disabled={loading === pack.id}
                className={`${pack.popular ? "btn-primary" : "btn-secondary"} w-full flex items-center justify-center gap-2 disabled:opacity-50`}
              >
                {loading === pack.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "立即購買"
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Subscriptions */}
      {tab === "subscription" && (
        <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {SUBSCRIPTIONS.map((plan) => (
            <div
              key={plan.name}
              className={`glass rounded-2xl p-8 relative ${
                plan.popular ? "border-accent/50 ring-1 ring-accent/20" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-white text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> 最受歡迎
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">NT${plan.price.toLocaleString()}</span>
                  <span className="text-sm text-muted">/月</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`${plan.popular ? "btn-primary" : "btn-secondary"} w-full`}>
                即將推出
              </button>
            </div>
          ))}
          <p className="col-span-full text-center text-sm text-muted mt-4">
            月訂閱方案即將推出，目前請先使用點數包購買。
          </p>
        </div>
      )}

      {/* Credit costs table */}
      <div className="mt-20 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">點數消耗表</h2>
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted">功能</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted">點數</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { name: "草圖轉渲染", credits: 2 },
                { name: "寫實渲染", credits: 2 },
                { name: "照片改造", credits: 3 },
                { name: "風格轉換", credits: 2 },
                { name: "4K 放大", credits: 1 },
                { name: "文字生圖", credits: 1 },
              ].map((item) => (
                <tr key={item.name} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3 text-sm">{item.name}</td>
                  <td className="px-6 py-3 text-sm text-right">
                    <span className="inline-flex items-center gap-1 text-yellow-500">
                      <Zap className="w-3 h-3" />
                      {item.credits}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment methods */}
      <div className="mt-12 text-center">
        <p className="text-xs text-muted">
          付款由綠界科技 ECPay 安全處理 | 支援 VISA / MasterCard / JCB / ATM / 超商代碼
        </p>
      </div>
    </div>
  );
}
