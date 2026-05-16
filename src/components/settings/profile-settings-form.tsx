"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Camera,
  Mail,
  Palette,
  Shield,
  Smartphone,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { AVATAR_PRESETS } from "@/lib/avatar-presets";

type Profile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  isVerified: boolean;
};

type Settings = {
  theme: "light" | "dark" | "system";
  notifyMessages: boolean;
  notifySecurity: boolean;
  privacyReadReceipts: boolean;
  privacyOnlineStatus: boolean;
  privacyMessageRequests: boolean;
};

type Device = {
  id: string;
  label: string;
  fingerprint: string;
  trusted: boolean;
  lastSeenAt: string;
};

type Section = "profile" | "email" | "notifications" | "appearance" | "privacy" | "devices" | "danger";

const defaultSettings: Settings = {
  theme: "system",
  notifyMessages: true,
  notifySecurity: true,
  privacyReadReceipts: true,
  privacyOnlineStatus: true,
  privacyMessageRequests: false,
};

export function ProfileSettingsForm() {
  const [section, setSection] = useState<Section>("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [devices, setDevices] = useState<Device[]>([]);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [nextEmail, setNextEmail] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void (async () => {
      const [pRes, sRes, dRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/settings"),
        fetch("/api/devices"),
      ]);

      const pData = await pRes.json().catch(() => null);
      const sData = await sRes.json().catch(() => null);
      const dData = await dRes.json().catch(() => []);

      if (pData) {
        setProfile(pData);
        setName(pData.name ?? "");
        setBio(pData.bio ?? "");
        setNextEmail(pData.email ?? "");
      }
      if (sData) setSettings({ ...defaultSettings, ...sData });
      if (Array.isArray(dData)) setDevices(dData);
    })();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const currentAvatar = profile?.avatarUrl ?? AVATAR_PRESETS[0];

  async function patchSettings(patch: Partial<Settings>) {
    setError("");
    setMessage("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not update settings");
      return;
    }
    setSettings((prev) => ({ ...prev, ...data }));
    setMessage("Settings updated.");
  }

  const content = useMemo(() => {
    if (section === "email") {
      return (
        <section className="rounded-xl border border-white/10 bg-[#071528]/90">
          <div className="border-b border-white/8 px-5 py-4">
            <p className="text-sm font-semibold text-white">Email</p>
            <p className="text-xs text-white/35">Update your account email</p>
          </div>
          <form
            className="p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              setError("");
              setMessage("");
              const res = await fetch("/api/email", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: nextEmail }),
              });
              const data = await res.json().catch(() => ({}));
              setSaving(false);
              if (!res.ok) {
                setError(data.error ?? "Could not update email");
                return;
              }
              setProfile((prev) => (prev ? { ...prev, email: data.email } : prev));
              setMessage("Email updated.");
            }}
          >
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">Email address</span>
              <input value={nextEmail} onChange={(e) => setNextEmail(e.target.value)} className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#3B82F6]/45" type="email" required />
            </label>
            <div className="mt-4 flex justify-end">
              <button disabled={saving} className="h-9 rounded-lg bg-[#3B82F6] px-5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save email"}</button>
            </div>
          </form>
        </section>
      );
    }

    if (section === "notifications") {
      return (
        <section className="rounded-xl border border-white/10 bg-[#071528]/90 p-5">
          <p className="mb-4 text-sm font-semibold text-white">Notifications</p>
          {[
            ["Message notifications", "Notify me for new messages", settings.notifyMessages, "notifyMessages"],
            ["Security notifications", "Notify me for sign-in and suspicious activity", settings.notifySecurity, "notifySecurity"],
          ].map(([title, desc, val, key], idx) => (
            <div key={String(key)} className={`flex items-center justify-between py-3 ${idx === 0 ? "border-b border-white/6" : ""}`}>
              <div>
                <p className="text-sm font-medium text-white">{String(title)}</p>
                <p className="text-xs text-white/35">{String(desc)}</p>
              </div>
              <button
                type="button"
                onClick={() => void patchSettings({ [String(key)]: !Boolean(val) } as Partial<Settings>)}
                className={`relative h-5 w-9 rounded-full transition ${val ? "bg-[#3B82F6]" : "bg-white/15"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${val ? "left-4.5" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </section>
      );
    }

    if (section === "appearance") {
      return (
        <section className="rounded-xl border border-white/10 bg-[#071528]/90 p-5">
          <p className="mb-4 text-sm font-semibold text-white">Appearance</p>
          <div className="grid gap-2 md:grid-cols-3">
            {(["light", "dark", "system"] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => void patchSettings({ theme })}
                className={`rounded-lg border px-4 py-3 text-sm font-medium capitalize transition ${settings.theme === theme ? "border-[#3B82F6] bg-[#3B82F6]/20 text-white" : "border-white/10 bg-white/5 text-white/70 hover:text-white"}`}
              >
                {theme}
              </button>
            ))}
          </div>
        </section>
      );
    }

    if (section === "privacy") {
      return (
        <section className="rounded-xl border border-white/10 bg-[#071528]/90 p-5">
          <p className="mb-4 text-sm font-semibold text-white">Privacy</p>
          {[
            ["Read receipts", "Let others know when you've read their messages", settings.privacyReadReceipts, "privacyReadReceipts"],
            ["Online status", "Show when you're active to contacts", settings.privacyOnlineStatus, "privacyOnlineStatus"],
            ["Message requests", "Allow messages from people outside your contacts", settings.privacyMessageRequests, "privacyMessageRequests"],
          ].map(([title, desc, val, key], idx) => (
            <div key={String(key)} className={`flex items-center justify-between py-3 ${idx < 2 ? "border-b border-white/6" : ""}`}>
              <div>
                <p className="text-sm font-medium text-white">{String(title)}</p>
                <p className="text-xs text-white/35">{String(desc)}</p>
              </div>
              <button
                type="button"
                onClick={() => void patchSettings({ [String(key)]: !Boolean(val) } as Partial<Settings>)}
                className={`relative h-5 w-9 rounded-full transition ${val ? "bg-[#3B82F6]" : "bg-white/15"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${val ? "left-4.5" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </section>
      );
    }

    if (section === "devices") {
      return (
        <section className="rounded-xl border border-white/10 bg-[#071528]/90 p-5">
          <p className="mb-4 text-sm font-semibold text-white">Devices</p>
          <div className="space-y-2">
            {devices.map((d) => (
              <div key={d.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <p className="text-sm text-white">{d.label}</p>
                <p className="text-xs text-white/40">{d.fingerprint} · Last seen {new Date(d.lastSeenAt).toLocaleString()}</p>
              </div>
            ))}
            {devices.length === 0 ? <p className="text-sm text-white/45">No devices found.</p> : null}
          </div>
        </section>
      );
    }

    if (section === "danger") {
      return (
        <section className="rounded-xl border border-rose-500/25 bg-[#071528]/90 p-5">
          <p className="mb-2 text-sm font-semibold text-rose-300">Delete account</p>
          <p className="mb-4 text-xs text-rose-200/70">This action is permanent and will remove your account data.</p>
          <button
            type="button"
            disabled={deleting}
            onClick={async () => {
              const ok = window.confirm("Are you sure you want to delete your account permanently?");
              if (!ok) return;
              setDeleting(true);
              const res = await fetch("/api/account", { method: "DELETE" });
              setDeleting(false);
              if (!res.ok) {
                setError("Could not delete account");
                return;
              }
              await signOut({ callbackUrl: "/login" });
            }}
            className="h-9 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete account"}
          </button>
        </section>
      );
    }

    return (
      <>
        <section className="rounded-xl border border-white/10 bg-[#071528]/90">
          <div className="border-b border-white/8 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3B82F6]/15">
                <UserRound className="h-4 w-4 text-[#60A5FA]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Profile photo</p>
                <p className="text-xs text-white/35">Visible to your contacts</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <img src={currentAvatar} alt="avatar" className="h-16 w-16 rounded-full border-2 border-[#2f6fc6]/45 object-cover" />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0D2040] bg-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{profile?.name ?? "User"}</p>
                <p className="text-xs text-white/40">@{(profile?.email ?? "user").split("@")[0]} · Online</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <label className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-medium text-white/70 hover:border-[#3B82F6]/40 hover:text-[#93C5FD]">
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? "Uploading..." : "Upload photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setError("");
                        setMessage("");
                        setUploading(true);
                        const form = new FormData();
                        form.append("file", file);
                        const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
                        const data = await res.json().catch(() => ({}));
                        setUploading(false);
                        if (!res.ok) {
                          setError(data.error ?? "Upload failed");
                          return;
                        }
                        setProfile((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl } : prev));
                        setMessage("Profile photo updated.");
                      }}
                    />
                  </label>
                  <button type="button" className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-medium text-white/70 hover:border-[#3B82F6]/40 hover:text-[#93C5FD]">
                    <Camera className="h-3.5 w-3.5" />Pick avatar
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2 md:grid-cols-8 lg:grid-cols-10">
              {AVATAR_PRESETS.map((url) => (
                <button
                  key={url}
                  type="button"
                  className={`h-10 w-10 rounded-full border-2 p-0.5 ${profile?.avatarUrl === url ? "border-[#64bcff]" : "border-[#21579f]"}`}
                  onClick={async () => {
                    setError("");
                    setMessage("");
                    const res = await fetch("/api/profile/avatar-preset", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ avatarUrl: url }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setError(data.error ?? "Could not set avatar");
                      return;
                    }
                    setProfile((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl } : prev));
                    setMessage("Avatar preset selected.");
                  }}
                >
                  <img src={url} alt="preset avatar" className="h-full w-full rounded-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <form
          className="rounded-xl border border-white/10 bg-[#071528]/90"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setMessage("");
            setSaving(true);
            const res = await fetch("/api/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, bio }),
            });
            const data = await res.json().catch(() => ({}));
            setSaving(false);
            if (!res.ok) {
              setError(data.error ?? "Could not save profile");
              return;
            }
            setProfile(data);
            setMessage("Profile updated successfully.");
          }}
        >
          <div className="border-b border-white/8 px-5 py-4">
            <p className="text-sm font-semibold text-white">Personal information</p>
          </div>
          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">Display name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#3B82F6]/45" required minLength={2} maxLength={60} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">Username</span>
              <input value={(profile?.email ?? "").split("@")[0]} readOnly className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/70 outline-none" />
            </label>
            <label className="md:col-span-2 flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">Bio</span>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-20 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#3B82F6]/45" maxLength={240} />
            </label>
            {error ? <p className="md:col-span-2 text-sm text-rose-300">{error}</p> : null}
            {message ? <p className="md:col-span-2 text-sm text-emerald-300">{message}</p> : null}
            <div className="md:col-span-2 flex justify-end">
              <button disabled={saving} className="h-9 rounded-lg bg-[#3B82F6] px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>
            </div>
          </div>
        </form>
      </>
    );
  }, [
    section,
    profile,
    settings,
    devices,
    nextEmail,
    bio,
    name,
    saving,
    uploading,
    message,
    error,
    deleting,
    currentAvatar,
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden w-full shrink-0 rounded-xl border border-white/10 bg-[#0A1F3E]/90 p-3 lg:block">
          <div className="mb-4">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">Account</p>
            <button onClick={() => setSection("profile")} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${section === "profile" ? "border border-[#2f6fc6]/30 bg-[#2f6fc6]/20 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/85"}`}><UserRound className="h-4 w-4" />Profile</button>
            <button onClick={() => setSection("email")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${section === "email" ? "border border-[#2f6fc6]/30 bg-[#2f6fc6]/20 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/85"}`}><Mail className="h-4 w-4" />Email</button>
          </div>

          <div className="mb-4">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">Preferences</p>
            <button onClick={() => setSection("notifications")} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${section === "notifications" ? "border border-[#2f6fc6]/30 bg-[#2f6fc6]/20 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/85"}`}><Bell className="h-4 w-4" />Notifications</button>
            <button onClick={() => setSection("appearance")} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${section === "appearance" ? "border border-[#2f6fc6]/30 bg-[#2f6fc6]/20 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/85"}`}><Palette className="h-4 w-4" />Appearance</button>
            <button onClick={() => setSection("privacy")} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${section === "privacy" ? "border border-[#2f6fc6]/30 bg-[#2f6fc6]/20 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/85"}`}><Shield className="h-4 w-4" />Privacy</button>
            <button onClick={() => setSection("devices")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${section === "devices" ? "border border-[#2f6fc6]/30 bg-[#2f6fc6]/20 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/85"}`}><Smartphone className="h-4 w-4" />Devices</button>
          </div>

          <div>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">Danger zone</p>
            <button onClick={() => setSection("danger")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${section === "danger" ? "bg-rose-500/15 text-rose-300" : "text-rose-300/75 hover:bg-rose-500/10 hover:text-rose-300"}`}><Trash2 className="h-4 w-4" />Delete account</button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {content}
        </main>
    </div>
  );
}
