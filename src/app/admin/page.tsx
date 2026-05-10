import { AppShell, StatCard } from "@/components/app-shell";
import { requireUser } from "@/lib/require-user";

export default async function AdminPage() {
  await requireUser();
  return <AppShell title="Admin Control Panel" subtitle="User oversight, moderation, threat monitoring, and platform analytics."><div className="grid gap-4 md:grid-cols-4"><StatCard label="Users" value="1,248" hint="Total registered."/><StatCard label="Reports" value="12" hint="Pending moderation queue."/><StatCard label="Threats" value="5" hint="Open high-severity incidents."/><StatCard label="Storage" value="72%" hint="Secure file store utilization."/></div></AppShell>;
}
