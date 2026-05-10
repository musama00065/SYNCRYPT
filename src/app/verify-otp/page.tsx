"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function VerifyOtpPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") || "";
  const purpose = (params.get("purpose") || "activation") as "activation" | "login";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
      <div className="glass w-full rounded-2xl p-6">
        <h1 className="text-2xl font-semibold">Email OTP Verification</h1>
        <p className="mt-2 text-slate-300">We sent a 6-digit code to {email || "your email"}.</p>
        <form className="mt-5 grid gap-3" onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setLoading(true);
          const res = await fetch("/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp, purpose }),
          });
          setLoading(false);
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data.error ?? "Verification failed");
            return;
          }
          setMessage("Verification successful. You can now sign in.");
          router.push("/login");
        }}>
          <input className="rounded-lg border border-slate-700 bg-slate-950/60 p-3" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} minLength={6} maxLength={6} required />
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
          <button disabled={loading} className="rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950 disabled:opacity-60">{loading ? "Verifying..." : "Verify OTP"}</button>
        </form>
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
              body: JSON.stringify({ email, purpose }),
            });
            const data = await res.json().catch(() => ({}));
            setResending(false);
            if (!res.ok) {
              setError(data.error ?? "Could not resend OTP");
              return;
            }
            setMessage("A new OTP was sent.");
          }}
          className="mt-3 text-sm text-cyan-300 disabled:opacity-60"
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>
      </div>
    </main>
  );
}
