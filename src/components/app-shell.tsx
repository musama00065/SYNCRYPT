import Link from "next/link";
import { Home, MessageSquare, Settings, Shield } from "lucide-react";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { NetworkBackground } from "@/components/network-background";

const navItems = [
  { label: "Home", href: "/", icon: Home, key: "home" },
  { label: "Messages", href: "/dashboard", icon: MessageSquare, key: "messages" },
  { label: "Settings", href: "/settings", icon: Settings, key: "settings" },
] as const;

export async function AppShell({
  title,
  subtitle,
  children,
  hideHeader = false,
  activeNav = "settings",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  hideHeader?: boolean;
  activeNav?: "home" | "messages" | "settings";
}) {
  const session = await auth();
  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "user@syncrypt.app";
  const initials = userName.slice(0, 1).toUpperCase();

  return (
    <main className="relative min-h-screen bg-[#010b24]">
      <NetworkBackground />
      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-5 py-5 md:px-8 md:py-7">
        <nav className="mb-5 flex items-center justify-between rounded-2xl border border-[#0f458d] bg-[linear-gradient(180deg,rgba(1,19,56,0.95),rgba(1,14,42,0.92))] px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#1a66c3] bg-[#08245a]">
              <Shield className="h-6 w-6 text-[#35a0ff]" />
            </span>
            <h1 className="text-4xl font-semibold leading-none text-slate-100">
              Syn<span className="text-[#2f8fff]">Crypt</span>
            </h1>
          </div>

          <div className="flex items-stretch gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.key;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative inline-flex items-center gap-2 rounded-lg px-4 py-2 text-base transition ${
                    active ? "text-white" : "text-slate-300 hover:text-cyan-300"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-[#3ea0ff]" : "text-slate-300"}`} />
                  <span>{item.label}</span>
                  {active ? <span className="absolute -bottom-3 left-0 right-0 h-1 rounded-full bg-[#2f8fff]" /> : null}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 rounded-xl border border-[#1658b0] bg-[rgba(2,18,48,0.75)] px-3 py-2 md:flex">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0f3f88] text-xs font-bold text-[#9ad0ff]">{initials}</span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-100">{userName}</p>
                <p className="text-xs text-slate-300">Online</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </nav>
        {!hideHeader ? (
          <section className="glass rounded-2xl p-6 text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-2xl font-semibold">{title}</h1>
              <p className="mt-2 text-slate-300">{subtitle}</p>
            </div>
          </section>
        ) : null}
        <section className={`${hideHeader ? "" : "mt-6"} grid gap-4`}>{children}</section>
      </div>
    </main>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="glass rounded-xl p-4"><p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-2 text-sm text-slate-400">{hint}</p></div>;
}
