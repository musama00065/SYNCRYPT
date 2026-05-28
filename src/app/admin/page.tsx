import { AppShell, StatCard } from "@/components/app-shell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { ShieldAlert, Users, HardDrive, ShieldCheck, Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireUser();

  // Retrieve platform oversight stats directly from database
  const totalUsers = await prisma.user.count();
  const verifiedUsers = await prisma.user.count({ where: { isVerified: true } });
  const totalIncidents = await prisma.securityEvent.count({
    where: { severity: { in: ["warning", "critical"] } },
  });
  const totalMessages = await prisma.message.count();

  // Retrieve list of recent active users
  const userList = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  return (
    <AppShell 
      title="Admin Control Panel" 
      subtitle="Complete platform oversight, total users, security alerts telemetry, and message traffic integrity."
      activeNav="admin"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard 
          label="Total Registered" 
          value={`${totalUsers} Users`} 
          hint={`${verifiedUsers} fully verified account keys.`}
        />
        <StatCard 
          label="Open Platform Threats" 
          value={String(totalIncidents)} 
          hint="Incidents marked warning or critical."
        />
        <StatCard 
          label="Encrypted Persistence Logs" 
          value={String(totalMessages)} 
          hint="Persisted secure cyber message payloads."
        />
        <StatCard 
          label="Secure Server Node" 
          value="Online" 
          hint="All verification modules online."
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#051129]/80 p-5 shadow-xl backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#1a66c3]/50 bg-[#08245a]/80 text-[#3ea0ff]">
              <Users className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Registered System Accounts</h2>
              <p className="mt-1 text-[11px] text-slate-400">Complete listing of authenticated accounts key signatures, verification states, and signup dates.</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-900 bg-[#010817]/65">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 bg-[#051129]/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Display Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Security Signature Status</th>
                <th className="px-4 py-3 text-right">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs">
              {userList.map((usr) => {
                const verified = usr.isVerified;

                return (
                  <tr key={usr.id} className="hover:bg-slate-900/40 text-slate-200 transition-colors">
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{usr.id}</td>
                    <td className="px-4 py-3 font-semibold">{usr.name}</td>
                    <td className="px-4 py-3 text-slate-300">{usr.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${
                        verified 
                          ? "bg-emerald-950/70 border-emerald-900/60 text-emerald-300" 
                          : "bg-amber-950/70 border-amber-900/60 text-amber-300 animate-pulse"
                      }`}>
                        {verified ? (
                          <>
                            <Check size={8} />
                            Verified Identity
                          </>
                        ) : (
                          <>
                            <ShieldAlert size={8} />
                            Pending OTP
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 font-medium">
                      {new Date(usr.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {userList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-medium">
                    No registered user accounts found in database registry.
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
