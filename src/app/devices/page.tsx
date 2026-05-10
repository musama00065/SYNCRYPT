import { AppShell, StatCard } from "@/components/app-shell";
import { requireUser } from "@/lib/require-user";

export default async function DevicesPage() {
  await requireUser();
  return <AppShell title="Trusted Devices" subtitle="Zero-trust device registry, revocation, and active session tracking."><div className="grid gap-4 md:grid-cols-3"><StatCard label="Trusted" value="5" hint="Remembered devices."/><StatCard label="New Alerts" value="1" hint="Unknown fingerprint today."/><StatCard label="Active Sessions" value="2" hint="Concurrent secure sessions."/></div></AppShell>;
}
