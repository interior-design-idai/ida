"use client";

import { useState } from "react";
import { User, Mail, Lock, CreditCard, Bell, LogOut } from "lucide-react";

export default function AccountPage() {
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@example.com");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-10">Account Settings</h1>

      {/* Profile */}
      <section className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-6 flex items-center gap-2">
          <User className="w-4 h-4 text-accent-light" />
          Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm"
            />
          </div>
          <button className="btn-primary text-sm">Save Changes</button>
        </div>
      </section>

      {/* Password */}
      <section className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-6 flex items-center gap-2">
          <Lock className="w-4 h-4 text-accent-light" />
          Password
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm"
            />
          </div>
          <button className="btn-secondary text-sm">Update Password</button>
        </div>
      </section>

      {/* Subscription */}
      <section className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-6 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-accent-light" />
          Subscription
        </h2>
        <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
          <div>
            <div className="font-medium">Free Plan</div>
            <div className="text-sm text-muted">10 credits remaining</div>
          </div>
          <a href="/pricing" className="btn-primary text-sm !px-4 !py-2">
            Upgrade
          </a>
        </div>
      </section>

      {/* Danger zone */}
      <section className="glass rounded-2xl p-6 border-red-500/20">
        <h2 className="font-semibold mb-4 text-red-400 flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Danger Zone
        </h2>
        <p className="text-sm text-muted mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="px-4 py-2 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
          Delete Account
        </button>
      </section>
    </div>
  );
}
