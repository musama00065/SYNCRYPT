"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        setLoading(true);
        await signOut({ redirect: false });
        router.push("/login");
        router.refresh();
      }}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-[#1658b0] bg-[rgba(2,18,48,0.75)] px-3 sm:px-4 text-sm font-semibold text-slate-100 transition hover:border-[#2d7de5]"
      disabled={loading}
    >
      <LogOut className="h-5 w-5 text-[#4da8ff]" />
      <span className="hidden sm:inline">{loading ? "Signing out..." : "Sign out"}</span>
    </button>
  );
}
