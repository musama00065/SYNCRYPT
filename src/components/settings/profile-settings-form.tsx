"use client";

import { useEffect, useState } from "react";
import { AVATAR_PRESETS } from "@/lib/avatar-presets";

type Profile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  isVerified: boolean;
};

export function ProfileSettingsForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void fetch("/api/profile").then((r) => r.json()).then((data) => {
      setProfile(data);
      setName(data?.name ?? "");
      setBio(data?.bio ?? "");
    });
  }, []);

  return (
    <div className="glass rounded-2xl p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-slate-100">Profile</h2>
      <p className="mt-2 text-base text-slate-300">Update your display profile and photo for social chat.</p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {profile?.avatarUrl ? (
          <img src={profile.avatarUrl} alt="avatar" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-slate-400" />
        )}

        <label className="inline-flex h-12 cursor-pointer items-center rounded-xl bg-cyan-500 px-6 text-base font-semibold text-slate-900">
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
              setMessage("Profile photo updated.");
            }}
          />
        </label>
      </div>
      <p className="mt-3 text-sm text-slate-300">Custom photos supported: JPG, PNG, WebP (up to 5MB).</p>

      <div className="mt-5">
        <p className="mb-3 text-base text-slate-300">Or pick from 50 preset avatars:</p>
        <div className="grid grid-cols-5 gap-3 md:grid-cols-8 lg:grid-cols-10">
          {AVATAR_PRESETS.map((url) => (
            <button
              key={url}
              type="button"
              className={`h-12 w-12 justify-self-start rounded-full border-2 p-0.5 ${profile?.avatarUrl === url ? "border-cyan-400" : "border-slate-700"}`}
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
              <img src={url} alt="preset avatar" className="h-full w-full rounded-full bg-slate-800 object-cover" />
            </button>
          ))}
        </div>
      </div>

      <form
        className="mt-6 grid max-w-4xl gap-3"
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
        <input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl border border-slate-700 bg-slate-950/60 px-4 text-base text-slate-100 placeholder:text-slate-500" placeholder="Display name" required minLength={2} maxLength={60} />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-24 rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-base text-slate-100 placeholder:text-slate-500" placeholder="Short bio" maxLength={240} />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        <button disabled={saving} className="h-12 rounded-xl bg-emerald-500 px-4 text-base font-semibold text-slate-900 disabled:opacity-60">{saving ? "Saving..." : "Save Profile"}</button>
      </form>
    </div>
  );
}
