import { AppShell, StatCard } from "@/components/app-shell";
import { requireUser } from "@/lib/require-user";

export default async function SecurityPage() {
  await requireUser();
  return <AppShell title="Security Analytics" subtitle="Threat detection, login anomalies, and session integrity telemetry."><div className="grid gap-4 md:grid-cols-4"><StatCard label="Security Score" value="92/100" hint="Weighted from active controls."/><StatCard label="Failed Logins" value="14" hint="Last 24 hours."/><StatCard label="Risk Alerts" value="3" hint="Geo and velocity anomalies."/><StatCard label="Blocked Requests" value="88" hint="Rate limiter + validation."/></div></AppShell>;
}
