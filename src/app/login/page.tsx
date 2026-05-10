"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { NetworkBackground } from "@/components/network-background";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"password" | "otp">("password");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <main className="relative mx-auto flex min-h-screen w-full items-center justify-center bg-[#010b24] px-4 py-8">
      <NetworkBackground />
      <div className="relative z-10 w-full max-w-[460px] rounded-3xl border border-slate-700/50 bg-[#071633] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <h1 className="text-3xl font-semibold text-slate-200">Login Account</h1>
        <div className="mt-6">
          <form
            className="grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setMessage("");
              setLoading(true);

              if (step === "password") {
                const res = await fetch("/api/auth/login-otp", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password }),
                });
                setLoading(false);
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                  setError(data.error ?? "Login failed");
                  return;
                }
                setMessage("OTP sent to your email.");
                setStep("otp");
                return;
              }

              const result = await signIn("credentials", { email, password, otp, redirect: false });
              setLoading(false);
              if (result?.error) {
                setError("Invalid OTP or credentials");
                return;
              }
              router.push("/dashboard");
              router.refresh();
            }}
          >
            <input className="h-12 rounded-xl border border-slate-700 bg-[#020c2a] px-4 text-base text-slate-200 outline-none placeholder:text-slate-500 focus:border-slate-500" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="relative">
              <input className="h-12 w-full rounded-xl border border-slate-700 bg-[#020c2a] px-4 pr-14 text-base text-slate-200 outline-none placeholder:text-slate-500 focus:border-slate-500" placeholder="Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {step === "otp" ? <input className="h-12 rounded-xl border border-slate-700 bg-[#020c2a] px-4 text-base text-slate-200 outline-none placeholder:text-slate-500 focus:border-slate-500" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} minLength={6} maxLength={6} required /> : null}
            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
            <button disabled={loading} className="h-12 rounded-xl bg-emerald-500 text-base font-semibold text-[#03201b] transition hover:brightness-110 disabled:opacity-60">{loading ? "Please wait..." : step === "password" ? "Send OTP" : "Verify & Login"}</button>
          </form>
          {step === "otp" ? (
            <button
              type="button"
              disabled={resending}
              onClick={async () => {
                setError("");
                setMessage("");
                setResending(true);
                const res = await fetch("/api/auth/resend-otp", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, purpose: "login" }),
                });
                const data = await res.json().catch(() => ({}));
                setResending(false);
                if (!res.ok) {
                  setError(data.error ?? "Could not resend OTP");
                  return;
                }
                setMessage("A new OTP has been sent.");
              }}
              className="mx-auto mt-3 block text-sm text-cyan-300 underline disabled:opacity-60"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          ) : null}

          <p className="mt-6 text-center text-lg text-slate-300">
            Want to create an account? <Link href="/register" className="text-cyan-300 underline">Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
