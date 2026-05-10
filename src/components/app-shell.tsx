import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { NetworkBackground } from "@/components/network-background";

export function AppShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-[#010b24]">
      <NetworkBackground />
      <div className="relative z-10 mx-auto w-full max-w-6xl p-6 md:p-10">
        <nav className="mb-6 flex flex-wrap gap-2 text-sm text-slate-300">
          {[["Home","/"],["Messages","/dashboard"],["Settings","/settings"]].map(([label,href]) => (
            <Link key={href} href={href} className="glass rounded-full px-3 py-1.5 hover:text-cyan-300">{label}</Link>
          ))}
          <span className="ml-auto">
            <LogoutButton />
          </span>
        </nav>
        <section className="glass rounded-2xl p-6">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-1 text-slate-300">{subtitle}</p>
        </section>
        <section className="mt-6 grid gap-4">{children}</section>
      </div>
    </main>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="glass rounded-xl p-4"><p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-2 text-sm text-slate-400">{hint}</p></div>;
}
