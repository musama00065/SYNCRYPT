import Link from "next/link";
import { Bell, Home, MessageSquare, Settings, Shield, ShieldAlert, Smartphone } from "lucide-react";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { NetworkBackground } from "@/components/network-background";

const navItems = [
  { label: "Home", href: "/", icon: Home, key: "home" },
  { label: "Messages", href: "/dashboard", icon: MessageSquare, key: "messages" },
  { label: "Security", href: "/security", icon: Shield, key: "security" },
  { label: "Devices", href: "/devices", icon: Smartphone, key: "devices" },
  { label: "Alerts", href: "/notifications", icon: Bell, key: "notifications" },
  { label: "Admin", href: "/admin", icon: ShieldAlert, key: "admin" },
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
  activeNav?: "home" | "messages" | "security" | "devices" | "notifications" | "admin" | "settings";
}) {
  const session = await auth();
  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "user@syncrypt.app";
  const initials = userName.slice(0, 1).toUpperCase();

  return (
    <main className="relative min-h-screen bg-[#010b24]">
      <NetworkBackground />
      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-4 py-4 md:px-8 md:py-6 flex flex-col gap-5">
        <nav className="sticky top-4 z-50 flex items-center justify-between rounded-2xl border border-slate-800/80 bg-[#051129]/80 px-5 py-3 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-[#08224d]/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Shield className="h-5 w-5 text-cyan-400" />
            </span>
            <h1 className="text-xl font-bold leading-none text-white tracking-tight">
              Syn<span className="text-[#3ea0ff]">Crypt</span>
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.key;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    active 
                      ? "text-white bg-[#071633]/60 border border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.4)]" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {active ? (
                    <span className="absolute -bottom-1.5 left-4 right-4 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                  ) : null}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 rounded-xl border border-slate-800 bg-[#020b1c]/80 px-3 py-1.5 sm:flex">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#08224d] text-[10px] font-bold text-cyan-400 border border-cyan-500/20">{initials}</span>
              <div className="leading-none">
                <p className="text-xs font-bold text-white">{userName}</p>
                <p className="text-[9px] text-[#3ea0ff] mt-0.5 font-medium flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
                  Online
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </nav>

        {/* Mobile secondary navigation selector if menu hidden */}
        <div className="flex md:hidden gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.key;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 shrink-0 rounded-xl px-3.5 py-1.5 text-[10px] font-bold border transition-all outline-none ${
                  active
                    ? "border-cyan-500/40 bg-[#071633] text-white shadow-sm"
                    : "border-transparent bg-[#051129]/60 text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="h-3 w-3" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {!hideHeader ? (
          <section className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[linear-gradient(180deg,#051532_0%,#020b18_100%)] p-6 md:p-8 text-center shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_350px_at_50%_-100px,rgba(6,182,212,0.14),transparent_70%)] pointer-events-none" />
            <div className="relative z-10 mx-auto max-w-2xl flex flex-col items-center">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{title}</h1>
              <p className="mt-2 text-xs text-slate-400 font-medium leading-relaxed">{subtitle}</p>
            </div>
          </section>
        ) : null}
        <section className="grid gap-4">{children}</section>
      </div>
    </main>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="glass rounded-xl p-4"><p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-2 text-sm text-slate-400">{hint}</p></div>;
}
