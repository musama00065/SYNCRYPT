import { AppShell } from "@/components/app-shell";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { requireUser } from "@/lib/require-user";

export default async function SettingsPage() {
  await requireUser();
  return (
    <AppShell title="Profile & Settings" subtitle="Manage profile identity and account preferences.">
      <div className="w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <ProfileSettingsForm />
      </div>
    </AppShell>
  );
}
