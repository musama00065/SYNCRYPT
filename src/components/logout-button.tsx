"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

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
      className="glass rounded-full px-3 py-1.5 text-sm text-slate-300 hover:text-rose-300"
      disabled={loading}
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
