import { AppShell, StatCard } from "@/components/app-shell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { Bell, ShieldAlert, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();

  const alerts = await prisma.securityEvent.findMany({
    where: { 
      userId: user.id,
      severity: { in: ["warning", "critical"] }
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const criticalCount = await prisma.securityEvent.count({
    where: { userId: user.id, severity: "critical" },
  });

  const warningCount = await prisma.securityEvent.count({
    where: { userId: user.id, severity: "warning" },
  });

  const infoCount = await prisma.securityEvent.count({
    where: { userId: user.id, severity: "info" },
  });

  return (
    <AppShell 
      title="Notifications Center" 
      subtitle="Critical threat alerts, suspicious logs, and user preference updates in real time."
      activeNav="notifications"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          label="Critical Notifications" 
          value={String(criticalCount)} 
          hint={criticalCount > 0 ? "Immediate resolution required!" : "No critical breaches found."}
        />
        <StatCard 
          label="Warning Alerts" 
          value={String(warningCount)} 
          hint={warningCount > 0 ? "Inspect suspicious anomalies." : "Clean activity pattern."}
        />
        <StatCard 
          label="Routine System Audits" 
          value={String(infoCount)} 
          hint="Standard activities recorded."
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#051129]/80 p-5 shadow-xl backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#1a66c3]/50 bg-[#08245a]/80 text-[#3ea0ff]">
              <Bell className="h-4.5 w-4.5 animate-bounce" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Security Incident Feed</h2>
              <p className="mt-1 text-[11px] text-slate-400">Review critical logs and active locks established on this secure profile.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => {
            const isCritical = alert.severity === "critical";

            return (
              <div 
                key={alert.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition ${
                  isCritical 
                    ? "bg-rose-950/20 border-rose-900/50 text-rose-100 hover:bg-rose-950/30" 
                    : "bg-amber-950/15 border-amber-900/40 text-amber-100 hover:bg-amber-950/20"
                }`}
              >
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${
                  isCritical 
                    ? "bg-rose-900/30 border-rose-700/40 text-rose-400" 
                    : "bg-amber-900/30 border-amber-700/40 text-amber-400"
                }`}>
                  <ShieldAlert size={16} />
                </span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h3 className="text-sm font-bold capitalize leading-none">{alert.type.replace(/_/g, " ")}</h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed font-medium">
                    Suspicious operation identified from Source IP <span className="font-mono text-white bg-slate-900/60 px-1 py-0.5 rounded border border-slate-800">{alert.ip || "unknown"}</span>. 
                    {alert.meta && ` Additional telemetry payload: ${alert.meta}`}
                  </p>
                </div>
              </div>
            );
          })}

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/40 border border-emerald-900 text-emerald-400 mb-3 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
                <CheckCircle size={24} />
              </span>
              <h3 className="text-sm font-bold text-white">No Unresolved Threats</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-[280px]">Your security event feed contains zero critical incidents or pending warning locks.</p>
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
