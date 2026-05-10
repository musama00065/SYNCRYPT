"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/network-background";

const links = [
  ["Login", "/login"],
  ["Register", "/register"],
] as const;

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#010b24] px-4 py-8">
      <NetworkBackground strong />
      <motion.header initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-[460px] rounded-3xl border border-slate-700/50 bg-[#071633] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <h1 className="text-5xl font-semibold text-slate-200">Create Account</h1>
      </motion.header>

      <section className="relative z-10 mt-5 w-full max-w-[460px] rounded-3xl border border-slate-700/50 bg-[#071633] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        {links.map(([label, href], i) => (
          <motion.div key={href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="mb-3 last:mb-0">
            <Link href={href} className="block h-12 rounded-xl border border-slate-700 bg-[#020c2a] px-4 text-center text-base font-semibold leading-[3rem] text-slate-200 transition hover:border-slate-500 hover:text-cyan-300">
              {label}
            </Link>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
