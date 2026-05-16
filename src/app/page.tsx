"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Shield, User, UserRoundPlus } from "lucide-react";
import { NetworkBackground } from "@/components/network-background";

export default function Home() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#010b24] px-4 py-4">
      <NetworkBackground strong />
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[440px] rounded-[22px] border border-[#1b4d99] bg-[linear-gradient(180deg,#021839_0%,#010d27_100%)] px-5 py-5 shadow-[0_22px_55px_rgba(0,0,0,0.6)]"
      >
        <div className="mx-auto flex w-fit items-center gap-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#1f71d8] bg-[linear-gradient(180deg,#0c5be8,#0a2f90)] shadow-[0_8px_20px_rgba(13,94,235,0.35)]">
              <Shield className="h-6 w-6 text-[#a9d8ff]" strokeWidth={2.2} />
            </span>
            <h1 className="text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
            Syn<span className="text-[#2486ff]">Crypt</span>
          </h1>
        </div>

        <p className="mt-2 text-center text-[10px] leading-none tracking-[0.25em] text-[#9bb6df]">SECURE MESSAGING</p>

        <div className="mt-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#22518f]" />
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#1c64c4] bg-[#041838]">
            <Shield className="h-4 w-4 text-[#2d88ff]" strokeWidth={2.4} />
          </span>
          <span className="h-px flex-1 bg-[#22518f]" />
        </div>

        <h2 className="mt-5 text-center text-2xl font-semibold leading-[1.2] tracking-[-0.02em] text-white">
          Secure <span className="text-[#2f8fff]">Conversations.</span>
          <br />
          Complete <span className="text-[#2f8fff]">Privacy.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-[380px] text-center text-sm leading-[1.4] text-[#c0d1ef]">
          End-to-end encrypted messaging platform built for privacy, security and trust.
        </p>

        <div className="mt-5 grid gap-2.5">
          <Link
            href="/login"
            className="group flex h-12 items-center rounded-xl border border-[#2c78df] bg-[linear-gradient(180deg,#1557cf_0%,#0c45b9_100%)] px-4 text-lg font-semibold text-white shadow-[0_10px_20px_rgba(14,84,220,0.34)] transition hover:brightness-110"
          >
            <User className="h-5 w-5 text-[#d8ebff]" strokeWidth={2.3} />
            <span className="ml-3">Sign In</span>
            <ChevronRight className="ml-auto h-5 w-5 text-[#d5e7ff] transition group-hover:translate-x-1" />
          </Link>
          <Link
            href="/register"
            className="group flex h-12 items-center rounded-xl border border-[#1453b2] bg-[rgba(4,21,52,0.6)] px-4 text-lg font-semibold text-[#f1f7ff] transition hover:border-[#2f7de4] hover:bg-[rgba(13,47,108,0.55)]"
          >
            <UserRoundPlus className="h-5 w-5 text-[#d8ebff]" strokeWidth={2.3} />
            <span className="ml-3">Create Account</span>
            <ChevronRight className="ml-auto h-5 w-5 text-[#d5e7ff] transition group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#204d87]" />
          <span className="text-xs font-medium tracking-[0.1em] text-[#a8bde2] md:text-sm">OR</span>
          <span className="h-px flex-1 bg-[#204d87]" />
        </div>

        <div className="mt-3 flex items-start justify-center gap-2 text-center">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#84b8ff]" />
          <p className="text-xs leading-[1.35] text-[#b9ccea]">
            Protected with End-to-End Encryption
            <br />
            Your privacy is our priority.
          </p>
        </div>
      </motion.section>
    </main>
  );
}
