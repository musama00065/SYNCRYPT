import { AppShell, StatCard } from "@/components/app-shell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { Smartphone, Monitor, ShieldCheck, ShieldAlert, Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  const user = await requireUser();

  // Retrieve actual user terminals and sessions from the database
  const devices = await prisma.device.findMany({
    where: { userId: user.id },
    orderBy: { lastSeenAt: "desc" },
  });

  const sessionCount = await prisma.session.count({
    where: { userId: user.id },
  });

  const trustedCount = devices.filter((d) => d.trusted).length;
  const untrustedCount = devices.length - trustedCount;

  return (
    <AppShell 
      title="Trusted Devices" 
      subtitle="Zero-trust device registry, session fingerprint auditing, and hardware authorizations."
      activeNav="devices"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          label="Trusted Terminals" 
          value={String(trustedCount)} 
          hint="Remembered secure hardware."
        />
        <StatCard 
          label="Untrusted signatures" 
          value={String(untrustedCount)} 
          hint={untrustedCount > 0 ? "Requires user verification!" : "All endpoints verified."}
        />
        <StatCard 
          label="Active Secure Sessions" 
          value={String(sessionCount)} 
          hint="Concurrent database tokens."
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#051129]/80 p-5 shadow-xl backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#1a66c3]/50 bg-[#08245a]/80 text-[#3ea0ff]">
              <Smartphone className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Registered Device Registry</h2>
              <p className="mt-1 text-[11px] text-slate-400">Manage recognized user agents, secure key fingerprints, and session states.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {devices.map((dev) => {
            const isTrusted = dev.trusted;
            const isDesktop = dev.label.toLowerCase().includes("windows") || dev.label.toLowerCase().includes("mac") || dev.label.toLowerCase().includes("linux");

            return (
              <div 
                key={dev.id} 
                className="relative overflow-hidden rounded-xl border border-slate-850 bg-[#020b1c]/70 p-4 transition hover:border-[#1a66c3]/40"
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    {isDesktop ? <Monitor size={20} /> : <Smartphone size={20} />}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                    isTrusted 
                      ? "bg-emerald-950/70 border-emerald-900/60 text-emerald-300" 
                      : "bg-amber-950/70 border-amber-900/60 text-amber-300 animate-pulse"
                  }`}>
                    {isTrusted ? (
                      <>
                        <ShieldCheck size={10} />
                        Trusted
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={10} />
                        Untrusted
                      </>
                    )}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-white leading-tight">{dev.label || "Unknown Web Terminal"}</h3>
                
                <div className="mt-3 space-y-1.5 text-[10px] text-slate-400 font-mono">
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-sans">Fingerprint:</span>
                    <span className="truncate max-w-[150px] font-semibold text-slate-300" title={dev.fingerprint}>
                      {dev.fingerprint.slice(0, 16)}...
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-sans">Last Seen:</span>
                    <span className="font-semibold text-slate-300">
                      {new Date(dev.lastSeenAt).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
          
          {devices.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-500 font-medium">
              No devices registered in database. Active session is running in temporary mode.
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
