"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { NetworkBackground } from "@/components/network-background";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <main className="relative mx-auto flex h-screen w-full items-center justify-center overflow-hidden bg-[#010b24] px-4 py-4">
      <NetworkBackground />
      <div className="relative z-10 w-full max-w-[440px] rounded-[22px] border border-[#1b4d99] bg-[linear-gradient(180deg,#021839_0%,#010d27_100%)] p-5 shadow-[0_22px_55px_rgba(0,0,0,0.6)]">
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#154b98] bg-[linear-gradient(90deg,rgba(5,34,80,0.88),rgba(2,20,56,0.7))] px-3 py-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#246fcd] bg-[#0b2d67]">
            <UserRound className="h-5 w-5 text-[#84c1ff]" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-white">Create Account</h1>
            <p className="text-xs text-[#9ab8e5]">Start your secure SynCrypt journey</p>
          </div>
        </div>
        <form
          className="mt-4 grid gap-3"
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
          <input className="h-11 rounded-xl border border-[#1d4f97] bg-[#031738] px-4 text-sm text-slate-200 outline-none placeholder:text-slate-400 focus:border-[#2f7de4]" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} minLength={2} required />
          <input className="h-11 rounded-xl border border-[#1d4f97] bg-[#031738] px-4 text-sm text-slate-200 outline-none placeholder:text-slate-400 focus:border-[#2f7de4]" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="h-11 rounded-xl border border-[#1d4f97] bg-[#031738] px-4 text-sm text-slate-200 outline-none placeholder:text-slate-400 focus:border-[#2f7de4]" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button disabled={loading} className="h-11 rounded-xl border border-[#2c78df] bg-[linear-gradient(180deg,#1557cf_0%,#0c45b9_100%)] text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">{loading ? "Creating..." : "Register"}</button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-[#9cc7ff] underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

