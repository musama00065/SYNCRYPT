import { AppShell } from "@/components/app-shell";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { requireUser } from "@/lib/require-user";

export default async function SettingsPage() {
  await requireUser();
  return (
    <AppShell title="Profile & Settings" subtitle="Manage profile identity and account preferences." activeNav="settings">
      <div className="w-full max-w-6xl mx-auto mt-2">
        <ProfileSettingsForm />
      </div>
    </AppShell>
  );
}
