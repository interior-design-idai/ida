"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sparkles, Menu, X, Zap } from "lucide-react";

const NAV_LINKS = [
  { href: "/create", label: "開始創作" },
  { href: "/gallery", label: "作品展示" },
  { href: "/pricing", label: "方案價格" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">IDA</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-accent-light bg-accent-glow border border-accent/20"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === "/dashboard" || pathname.startsWith("/dashboard/")
                  ? "text-accent-light bg-accent-glow border border-accent/20"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Zap className="w-4 h-4 text-warning" />
              <span>10 點數</span>
            </Link>
            <Link href="/login" className="btn-primary text-sm !px-4 !py-2">
              登入
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted hover:text-foreground"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border px-4 py-4 space-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-accent-light bg-accent-glow border border-accent/20"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-muted"
            >
              <Zap className="w-4 h-4 text-warning" />
              10 點數
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block btn-primary text-sm text-center !px-4 !py-2"
            >
              登入
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
