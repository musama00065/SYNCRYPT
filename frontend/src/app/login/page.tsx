"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, UserRound } from "lucide-react";
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
    <main className="relative mx-auto flex h-screen w-full items-center justify-center overflow-hidden bg-[#010b24] px-4 py-4">
      <NetworkBackground />
      <div className="relative z-10 w-full max-w-[440px] rounded-[22px] border border-[#1b4d99] bg-[linear-gradient(180deg,#021839_0%,#010d27_100%)] p-5 shadow-[0_22px_55px_rgba(0,0,0,0.6)]">
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#154b98] bg-[linear-gradient(90deg,rgba(5,34,80,0.88),rgba(2,20,56,0.7))] px-3 py-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#246fcd] bg-[#0b2d67]">
            <UserRound className="h-5 w-5 text-[#84c1ff]" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-white">Login Account</h1>
            <p className="text-xs text-[#9ab8e5]">Secure access to your SynCrypt profile</p>
          </div>
        </div>
        <div className="mt-4">
          <form
            className="grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setMessage("");
              setLoading(true);

              if (step === "password") {
                const res = await fetch("/api/auth/login", {
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
                setMessage("Logged in successfully.");
                router.push("/dashboard");
                router.refresh();
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
            <input className="h-11 rounded-xl border border-[#1d4f97] bg-[#031738] px-4 text-sm text-slate-200 outline-none placeholder:text-slate-400 focus:border-[#2f7de4]" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="relative">
              <input className="h-11 w-full rounded-xl border border-[#1d4f97] bg-[#031738] px-4 pr-12 text-sm text-slate-200 outline-none placeholder:text-slate-400 focus:border-[#2f7de4]" placeholder="Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {step === "otp" ? <input className="h-11 rounded-xl border border-[#1d4f97] bg-[#031738] px-4 text-sm text-slate-200 outline-none placeholder:text-slate-400 focus:border-[#2f7de4]" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} minLength={6} maxLength={6} required /> : null}
            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
            <button disabled={loading} className="h-11 rounded-xl border border-[#2c78df] bg-[linear-gradient(180deg,#1557cf_0%,#0c45b9_100%)] text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">{loading ? "Please wait..." : step === "password" ? "Sign In" : "Verify & Login"}</button>
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
              className="mx-auto mt-3 block text-sm text-[#9cc7ff] underline disabled:opacity-60"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          ) : null}

          <p className="mt-5 text-center text-sm text-slate-400">
            Want to create an account? <Link href="/register" className="text-[#9cc7ff] underline">Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
