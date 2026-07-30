import { AppShell, StatCard } from "@/components/app-shell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { Shield, ShieldAlert, Activity, Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const user = await requireUser();

  const events = await prisma.securityEvent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  const failedOtpCount = await prisma.securityEvent.count({
    where: { userId: user.id, type: "invalid_otp_attempt" },
  });

  const messageCount = await prisma.securityEvent.count({
    where: { userId: user.id, type: "message_sent_encrypted" },
  });

  const deviceCount = await prisma.device.count({
    where: { userId: user.id },
  });

  let securityScore = 60;
  if (user.id) securityScore += 10;
  if (deviceCount > 0) securityScore += 15;
  if (failedOtpCount === 0) securityScore += 15;
  if (messageCount > 0) securityScore += 10;
  if (securityScore > 100) securityScore = 100;

  return (
    <AppShell 
      title="Security Analytics" 
      subtitle="Real-time threat detection, login anomalies, and session integrity telemetry."
      activeNav="security"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard 
          label="Security Score" 
          value={`${securityScore}/100`} 
          hint={securityScore >= 80 ? "Excellent security profile." : "Improve via OTP/Device verification."}
        />
        <StatCard 
          label="Authentication Failures" 
          value={String(failedOtpCount)} 
          hint="OTP validation lockout blocks."
        />
        <StatCard 
          label="Encrypted Persistent Audits" 
          value={String(messageCount)} 
          hint="AES-256-GCM zero-trust events."
        />
        <StatCard 
          label="Registered Terminals" 
          value={String(deviceCount)} 
          hint="Active zero-trust hardware keys."
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#051129]/80 p-5 shadow-xl backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#1a66c3]/50 bg-[#08245a]/80 text-[#3ea0ff]">
              <Cpu className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Security Telemetry Logs</h2>
              <p className="mt-1 text-[11px] text-slate-400">Live auditing feeds populated directly from critical API operations.</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-900 bg-[#010817]/65">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 bg-[#051129]/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Event Signature</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Source Endpoint IP</th>
                <th className="px-4 py-3">Payload Data</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs">
              {events.map((evt) => {
                let severityColor = "bg-slate-950/80 text-slate-400 border-slate-800";
                if (evt.severity === "warning") {
                  severityColor = "bg-amber-950/70 text-amber-300 border-amber-900/60";
                } else if (evt.severity === "critical") {
                  severityColor = "bg-rose-950/70 text-rose-300 border-rose-900/60";
                } else if (evt.severity === "info") {
                  severityColor = "bg-cyan-950/70 text-cyan-300 border-cyan-900/60";
                }

                let friendlyType = evt.type.replace(/_/g, " ");

                return (
                  <tr key={evt.id} className="hover:bg-slate-900/40 text-slate-200 transition-colors">
                    <td className="px-4 py-3 font-semibold capitalize flex items-center gap-1.5">
                      <Activity className="h-3 w-3 text-slate-500" />
                      {friendlyType}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${severityColor}`}>
                        {evt.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{evt.ip || "127.0.0.1"}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-400 truncate max-w-[200px]" title={evt.meta || ""}>
                      {evt.meta ? evt.meta : "NULL"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 font-medium">
                      {new Date(evt.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-medium">
                    No security events logged in this session yet. Execute an operation to trigger logs.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
