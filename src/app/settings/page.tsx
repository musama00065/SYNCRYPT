import { AppShell } from "@/components/app-shell";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { requireUser } from "@/lib/require-user";

export default async function SettingsPage() {
  await requireUser();
  return (
    <AppShell title="Profile & Settings" subtitle="Manage profile identity and account preferences.">
      <ProfileSettingsForm />
    </AppShell>
  );
}
