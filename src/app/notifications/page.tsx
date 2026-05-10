import { AppShell, StatCard } from "@/components/app-shell";
import { requireUser } from "@/lib/require-user";

export default async function NotificationsPage() {
  await requireUser();
  return <AppShell title="Notifications Center" subtitle="Message updates, security alerts, and device changes in real time."><div className="grid gap-4 md:grid-cols-3"><StatCard label="Critical" value="1" hint="Immediate action required."/><StatCard label="Warnings" value="4" hint="Suspicious activity checks."/><StatCard label="Info" value="16" hint="Routine activity events."/></div></AppShell>;
}
