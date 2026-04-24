"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Sparkles, Menu, X, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";

const NAV_LINKS = [
  { href: "/create", label: "開始創作" },
  { href: "/gallery", label: "作品展示" },
  { href: "/pricing", label: "方案價格" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // Fetch credits from users table
        supabase
          .from("users")
          .select("credits")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setCredits(data.credits);
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        supabase
          .from("users")
          .select("credits")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setCredits(data.credits);
          });
      } else {
        setUser(null);
        setCredits(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">IDAI</span>
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
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    pathname === "/dashboard" || pathname.startsWith("/dashboard/")
                      ? "text-accent-light bg-accent-glow border border-accent/20"
                      : "text-muted hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Zap className="w-4 h-4 text-warning" />
                  <span>{credits ?? 0} 點數</span>
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                  className="text-sm text-muted hover:text-foreground px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  登出
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-primary text-sm !px-4 !py-2">
                登入
              </Link>
            )}
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
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-muted"
                >
                  <Zap className="w-4 h-4 text-warning" />
                  {credits ?? 0} 點數
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setMobileOpen(false);
                    window.location.href = "/";
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-muted hover:text-foreground"
                >
                  登出
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block btn-primary text-sm text-center !px-4 !py-2"
              >
                登入
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
