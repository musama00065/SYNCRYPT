"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NetworkBackground } from "@/components/network-background";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <main className="relative mx-auto flex min-h-screen w-full items-center justify-center bg-[#010b24] px-4 py-8">
      <NetworkBackground />
      <div className="relative z-10 w-full max-w-[460px] rounded-3xl border border-slate-700/50 bg-[#071633] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <h1 className="text-3xl font-semibold text-slate-200">Create Account</h1>
        <form
          className="mt-6 grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setLoading(true);
            const res = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, email, password }),
            });
            setLoading(false);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              setError(data.error ?? "Registration failed");
              return;
            }
            router.push(`/verify-otp?email=${encodeURIComponent(email)}&purpose=activation`);
          }}
        >
          <input className="h-12 rounded-xl border border-slate-700 bg-[#020c2a] px-4 text-base text-slate-200 outline-none placeholder:text-slate-500 focus:border-slate-500" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} minLength={2} required />
          <input className="h-12 rounded-xl border border-slate-700 bg-[#020c2a] px-4 text-base text-slate-200 outline-none placeholder:text-slate-500 focus:border-slate-500" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="h-12 rounded-xl border border-slate-700 bg-[#020c2a] px-4 text-base text-slate-200 outline-none placeholder:text-slate-500 focus:border-slate-500" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button disabled={loading} className="h-12 rounded-xl bg-emerald-500 text-base font-semibold text-[#03201b] transition hover:brightness-110 disabled:opacity-60">{loading ? "Creating..." : "Register"}</button>
        </form>
        <p className="mt-6 text-center text-lg text-slate-300">
          Already have an account? <Link href="/login" className="text-cyan-300 underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
