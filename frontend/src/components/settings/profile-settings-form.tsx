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
  Monitor,
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

type Section = "profile" | "credentials" | "email" | "notifications" | "appearance" | "privacy" | "devices" | "danger";

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
    setMessage("Settings updated successfully.");
  }

  const content = useMemo(() => {
    if (section === "email") {
      return (
        <section className="rounded-2xl border border-slate-800/80 bg-[#051129]/60 p-5 backdrop-blur-md shadow-xl">
          <div className="border-b border-slate-850 pb-4 mb-4">
            <h2 className="text-base font-bold text-white leading-none">Security Email Signature</h2>
            <p className="mt-1 text-[11px] text-slate-400">Modify the primary destination for secure OTP requests and platform logs.</p>
          </div>
          <form
            className="space-y-4"
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
              setMessage("Verification email updated successfully.");
            }}
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Secure Email Address</span>
              <input 
                value={nextEmail} 
                onChange={(e) => setNextEmail(e.target.value)} 
                className="h-10 rounded-xl border border-slate-800 bg-[#020b1c] px-4 text-xs text-slate-200 outline-none focus:border-[#1e5eb8]/80 focus:ring-1 focus:ring-[#1e5eb8]/30 transition-all" 
                type="email" 
                required 
              />
            </label>
            {error ? <p className="text-xs text-rose-400 font-medium">{error}</p> : null}
            {message ? <p className="text-xs text-emerald-400 font-medium">{message}</p> : null}
            <div className="flex justify-end">
              <button disabled={saving} className="inline-flex items-center h-9 rounded-xl bg-[#1557cf] hover:bg-[#1a64e8] disabled:opacity-40 disabled:hover:bg-[#1557cf] text-xs font-bold text-white px-5 transition-all shadow-[0_4px_12px_rgba(21,87,207,0.3)]">{saving ? "Saving..." : "Update Email"}</button>
            </div>
          </form>
        </section>
      );
    }

    if (section === "notifications") {
      return (
        <section className="rounded-2xl border border-slate-800/80 bg-[#051129]/60 p-5 backdrop-blur-md shadow-xl">
          <div className="border-b border-slate-850 pb-4 mb-4">
            <h2 className="text-base font-bold text-white leading-none">Security Telemetry Alerts</h2>
            <p className="mt-1 text-[11px] text-slate-400">Configure your parameters for system locks and incoming message events.</p>
          </div>
          <div className="space-y-1">
            {[
              ["Conversations notification", "Notify me for new secure messages", settings.notifyMessages, "notifyMessages"],
              ["Suspicious logins notification", "Notify me for new login attempts and OTP releases", settings.notifySecurity, "notifySecurity"],
            ].map(([title, desc, val, key], idx) => (
              <div key={String(key)} className={`flex items-center justify-between py-3 ${idx === 0 ? "border-b border-slate-850" : ""}`}>
                <div>
                  <p className="text-sm font-semibold text-white leading-snug">{String(title)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{String(desc)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void patchSettings({ [String(key)]: !Boolean(val) } as Partial<Settings>)}
                  className={`relative h-5 w-9 rounded-full transition-colors duration-200 outline-none ${val ? "bg-[#1557cf] shadow-[0_0_8px_rgba(21,87,207,0.4)]" : "bg-slate-850 border border-slate-800"}`}
                >
                  <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all duration-200 shadow-sm ${val ? "left-4.5" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (section === "appearance") {
      return (
        <section className="rounded-2xl border border-slate-800/80 bg-[#051129]/60 p-5 backdrop-blur-md shadow-xl">
          <div className="border-b border-slate-850 pb-4 mb-4">
            <h2 className="text-base font-bold text-white leading-none">Console Aesthetic theme</h2>
            <p className="mt-1 text-[11px] text-slate-400">Toggle dark modes or let system parameters govern styling.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["light", "dark", "system"] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => void patchSettings({ theme })}
                className={`rounded-xl border py-3 text-xs font-semibold capitalize transition-all duration-200 outline-none ${
                  settings.theme === theme 
                    ? "border-[#1c55a6]/60 bg-[linear-gradient(135deg,#071e42_0%,#031026_100%)] text-white shadow-[0_4px_12px_rgba(28,85,166,0.18)]" 
                    : "border-slate-850 bg-[#020b1c]/70 text-slate-400 hover:border-slate-800 hover:text-white"
                }`}
              >
                {theme} Mode
              </button>
            ))}
          </div>
        </section>
      );
    }

    if (section === "privacy") {
      return (
        <section className="rounded-2xl border border-slate-800/80 bg-[#051129]/60 p-5 backdrop-blur-md shadow-xl">
          <div className="border-b border-slate-850 pb-4 mb-4">
            <h2 className="text-base font-bold text-white leading-none">Zero-Trust Cryptographic Privacy</h2>
            <p className="mt-1 text-[11px] text-slate-400">Toggle privacy metadata records cached across conversation decryptions.</p>
          </div>
          <div className="space-y-1">
            {[
              ["Read Receipts", "Let peers verify when you have decrypted their messages", settings.privacyReadReceipts, "privacyReadReceipts"],
              ["Presence Online Signatures", "Expose active telemetry state within chat panels", settings.privacyOnlineStatus, "privacyOnlineStatus"],
              ["Strict Message Requests", "Block messaging flows unless active in direct contacts", settings.privacyMessageRequests, "privacyMessageRequests"],
            ].map(([title, desc, val, key], idx) => (
              <div key={String(key)} className={`flex items-center justify-between py-3 ${idx < 2 ? "border-b border-slate-850" : ""}`}>
                <div>
                  <p className="text-sm font-semibold text-white leading-snug">{String(title)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{String(desc)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void patchSettings({ [String(key)]: !Boolean(val) } as Partial<Settings>)}
                  className={`relative h-5 w-9 rounded-full transition-colors duration-200 outline-none ${val ? "bg-[#1557cf] shadow-[0_0_8px_rgba(21,87,207,0.4)]" : "bg-slate-850 border border-slate-800"}`}
                >
                  <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all duration-200 shadow-sm ${val ? "left-4.5" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (section === "devices") {
      return (
        <section className="rounded-2xl border border-slate-800/80 bg-[#051129]/60 p-5 backdrop-blur-md shadow-xl">
          <div className="border-b border-slate-850 pb-4 mb-4">
            <h2 className="text-base font-bold text-white leading-none">Hardware Session registry</h2>
            <p className="mt-1 text-[11px] text-slate-400">Track key authorizations established across active terminals.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {devices.map((d) => {
              const isDesktop = d.label.toLowerCase().includes("windows") || d.label.toLowerCase().includes("mac") || d.label.toLowerCase().includes("linux");
              return (
                <div key={d.id} className="rounded-xl border border-slate-850 bg-[#020b1c]/70 p-3.5 transition hover:border-[#1a66c3]/40">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                      {isDesktop ? <Monitor size={16} /> : <Smartphone size={16} />}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase ${
                      d.trusted 
                        ? "bg-emerald-950/70 border-emerald-900/60 text-emerald-300" 
                        : "bg-amber-950/70 border-amber-900/60 text-amber-300 animate-pulse"
                    }`}>
                      {d.trusted ? "Trusted" : "Untrusted"}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-xs font-bold text-white leading-none truncate">{d.label}</h3>
                  <p className="mt-2 text-[9px] text-slate-500 font-mono truncate">SHA-256: {d.fingerprint.slice(0, 16)}...</p>
                  <p className="mt-1 text-[9px] text-slate-500 font-sans">Seen {new Date(d.lastSeenAt).toLocaleDateString()}</p>
                </div>
              );
            })}
            {devices.length === 0 ? <p className="text-xs text-slate-500 col-span-full py-4 text-center">No hardware signatures found.</p> : null}
          </div>
        </section>
      );
    }

    if (section === "danger") {
      return (
        <section className="rounded-2xl border border-rose-950 bg-rose-950/10 p-5 shadow-xl backdrop-blur-md">
          <div className="border-b border-rose-900/30 pb-4 mb-4">
            <h2 className="text-base font-bold text-rose-300 leading-none font-sans">Cryptographic Purge Zone</h2>
            <p className="mt-1 text-[11px] text-rose-200/50">This action permanently deletes your credentials and decryptable databases.</p>
          </div>
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
            className="h-9 rounded-xl bg-rose-950/40 border border-rose-900/35 hover:bg-rose-900/30 hover:border-rose-800/40 text-rose-300 px-4 text-xs font-bold transition-all shadow-[0_4px_12px_rgba(225,29,72,0.12)]"
          >
            {deleting ? "Purging Records..." : "Terminate SynCrypt Profile"}
          </button>
        </section>
      );
    }

    if (section === "profile") {
      return (
        <section className="rounded-2xl border border-slate-800/80 bg-[#051129]/60 p-5 backdrop-blur-md shadow-xl">
          <div className="border-b border-slate-850 pb-4 mb-4">
            <h2 className="text-base font-bold text-white leading-none">Identity Signature Panel</h2>
            <p className="mt-1 text-[11px] text-slate-400">Establish cryptographic avatar identifiers visible inside encrypted tunnels.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 border-b border-slate-850/60 pb-4 mb-4">
            <div className="relative shrink-0">
              <img src={currentAvatar} alt="avatar" className="h-16 w-16 rounded-full border-2 border-cyan-500/40 object-cover shadow-[0_0_12px_rgba(6,182,212,0.25)]" />
              <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-[#051129] bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate leading-snug">{profile?.name ?? "Syncrypt Profile"}</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">@{(profile?.email ?? "user").split("@")[0]}</p>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-800 bg-[#020b1c]/80 px-3 text-xs font-semibold text-slate-300 hover:border-[#1e5eb8]/50 hover:bg-[#07152d] transition-all">
                  <Upload size={12} />
                  {uploading ? "Uploading..." : "Upload Photo"}
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
                      setMessage("Identity profile photo uploaded successfully.");
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-2.5">Select Presets Key Avatar</p>
            <div className="flex flex-wrap gap-2">
              {AVATAR_PRESETS.map((url) => (
                <button
                  key={url}
                  type="button"
                  className={`h-9 w-9 rounded-full border-2 p-0.5 transition hover:scale-105 ${profile?.avatarUrl === url ? "border-cyan-500/80 shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "border-slate-800 bg-[#020b1c]"}`}
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
                    setMessage("Avatar signature configured.");
                  }}
                >
                  <img src={url} alt="preset avatar" className="h-full w-full rounded-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (section === "credentials") {
      return (
        <form
          className="rounded-2xl border border-slate-800/80 bg-[#051129]/60 p-5 backdrop-blur-md shadow-xl space-y-4"
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
            setMessage("Profile identity updated successfully.");
          }}
        >
          <div className="border-b border-slate-850 pb-3">
            <h3 className="text-sm font-bold text-white">Display Credentials</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Display Name</span>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="h-10 rounded-xl border border-slate-800 bg-[#020b1c] px-4 text-xs text-slate-200 outline-none focus:border-[#1e5eb8]/80 focus:ring-1 focus:ring-[#1e5eb8]/30 transition-all" 
                required 
                minLength={2} 
                maxLength={60} 
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Secure Handle</span>
              <input 
                value={(profile?.email ?? "").split("@")[0]} 
                readOnly 
                className="h-10 rounded-xl border border-slate-800 bg-[#020b1c]/45 px-4 text-xs text-slate-500 outline-none" 
              />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Identity bio</span>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                className="min-h-16 rounded-xl border border-slate-800 bg-[#020b1c] p-3 text-xs text-slate-200 outline-none focus:border-[#1e5eb8]/80 focus:ring-1 focus:ring-[#1e5eb8]/30 transition-all resize-none" 
                maxLength={240} 
              />
            </label>
          </div>

          {error ? <p className="text-xs text-rose-400 font-medium">{error}</p> : null}
          {message ? <p className="text-xs text-emerald-400 font-medium">{message}</p> : null}
          
          <div className="flex justify-end">
            <button disabled={saving} className="inline-flex items-center h-9 rounded-xl bg-[#1557cf] hover:bg-[#1a64e8] disabled:opacity-40 disabled:hover:bg-[#1557cf] text-xs font-bold text-white px-5 transition-all shadow-[0_4px_12px_rgba(21,87,207,0.3)]">{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      );
    }

    return null;
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
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden no-scrollbar">
        {[
          ["profile", UserRound, "Avatar Signature"],
          ["credentials", Shield, "Display Credentials"],
          ["email", Mail, "Email"],
          ["notifications", Bell, "Alerts"],
          ["appearance", Palette, "Theme"],
          ["privacy", Shield, "Privacy"],
          ["devices", Smartphone, "Devices"],
          ["danger", Trash2, "Purge"],
        ].map(([sec, Icon, label]) => {
          const active = section === sec;
          const LucideIcon = Icon as any;
          return (
            <button
              key={String(sec)}
              onClick={() => setSection(sec as Section)}
              className={`flex items-center gap-1.5 shrink-0 rounded-xl px-4 py-2 text-xs font-bold border transition-all outline-none ${
                active
                  ? "border-[#1c55a6]/60 bg-[linear-gradient(135deg,#071e42_0%,#031026_100%)] text-white shadow-md"
                  : sec === "danger"
                  ? "border-rose-950/40 bg-rose-950/10 text-rose-300"
                  : "border-transparent bg-[#051129]/60 text-slate-400 hover:text-white"
              }`}
            >
              <LucideIcon className="h-3.5 w-3.5" />
              {String(label)}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden shrink-0 rounded-2xl border border-slate-800/80 bg-[#051129]/65 p-4 shadow-xl backdrop-blur-md lg:block h-fit space-y-4">
          <div>
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#3ea0ff]">Account Identity</p>
            <button 
              onClick={() => setSection("profile")} 
              className={`w-full flex items-center gap-2 rounded-xl px-3.5 py-2 text-left text-xs font-semibold border transition-all duration-200 outline-none ${
                section === "profile" 
                  ? "border-[#1c55a6]/60 bg-[linear-gradient(135deg,#071e42_0%,#031026_100%)] text-white shadow-[0_4px_12px_rgba(28,85,166,0.18)]" 
                  : "border-transparent text-slate-400 hover:bg-[#071633]/60 hover:text-white"
              }`}
            >
              <UserRound className="h-4 w-4" />Avatar Signature
            </button>
            <button 
              onClick={() => setSection("credentials")} 
              className={`mt-1 w-full flex items-center gap-2 rounded-xl px-3.5 py-2 text-left text-xs font-semibold border transition-all duration-200 outline-none ${
                section === "credentials" 
                  ? "border-[#1c55a6]/60 bg-[linear-gradient(135deg,#071e42_0%,#031026_100%)] text-white shadow-[0_4px_12px_rgba(28,85,166,0.18)]" 
                  : "border-transparent text-slate-400 hover:bg-[#071633]/60 hover:text-white"
              }`}
            >
              <Shield className="h-4 w-4" />Display Credentials
            </button>
            <button 
              onClick={() => setSection("email")} 
              className={`mt-1 w-full flex items-center gap-2 rounded-xl px-3.5 py-2 text-left text-xs font-semibold border transition-all duration-200 outline-none ${
                section === "email" 
                  ? "border-[#1c55a6]/60 bg-[linear-gradient(135deg,#071e42_0%,#031026_100%)] text-white shadow-[0_4px_12px_rgba(28,85,166,0.18)]" 
                  : "border-transparent text-slate-400 hover:bg-[#071633]/60 hover:text-white"
              }`}
            >
              <Mail className="h-4 w-4" />Email address
            </button>
          </div>

          <div>
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#3ea0ff]">Console Config</p>
            {[
              ["notifications", Bell, "Alerts & Feeds"],
              ["appearance", Palette, "Theme Style"],
              ["privacy", Shield, "Privacy Keys"],
              ["devices", Smartphone, "Hardware keys"],
            ].map(([sec, Icon, label]) => (
              <button 
                key={String(sec)}
                onClick={() => setSection(sec as Section)} 
                className={`mt-1 w-full flex items-center gap-2 rounded-xl px-3.5 py-2 text-left text-xs font-semibold border transition-all duration-200 outline-none ${
                  section === sec 
                    ? "border-[#1c55a6]/60 bg-[linear-gradient(135deg,#071e42_0%,#031026_100%)] text-white shadow-[0_4px_12px_rgba(28,85,166,0.18)]" 
                    : "border-transparent text-slate-400 hover:bg-[#071633]/60 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />{String(label)}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-900">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-rose-500/80">Purge parameters</p>
            <button 
              onClick={() => setSection("danger")} 
              className={`w-full flex items-center gap-2 rounded-xl px-3.5 py-2 text-left text-xs font-semibold border transition-all duration-200 outline-none ${
                section === "danger" 
                  ? "bg-rose-950/40 border-rose-900/35 text-rose-300" 
                  : "border-transparent text-rose-300/60 hover:bg-rose-950/20 hover:text-rose-300"
              }`}
            >
              <Trash2 className="h-4 w-4" />Purge Profile
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {content}
        </main>
      </div>
    </div>
  );
}
