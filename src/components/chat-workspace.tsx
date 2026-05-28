"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Lock, Send, Shield } from "lucide-react";

type User = { id: string; name: string; email: string; isVerified: boolean; avatarUrl?: string | null; bio?: string | null };
type Msg = {
  id: string;
  senderId: string;
  recipientId: string;
  status: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  expiresAt: string | null;
};

export function ChatWorkspace({ currentUserId, initialPeerId }: { currentUserId: string; initialPeerId?: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<{ name: string; avatarUrl: string | null } | null>(null);
  const [peerId, setPeerId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("0");
  const [sending, setSending] = useState(false);
  const [typingKeys, setTypingKeys] = useState<string[]>([]);
  const [presence, setPresence] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void fetch("/api/users").then((r) => r.json()).then((data) => {
      setUsers(data);
      if (initialPeerId && data.some((u: User) => u.id === initialPeerId)) setPeerId(initialPeerId);
      else if (data[0]?.id) setPeerId(data[0].id);
    });
  }, [initialPeerId]);
  useEffect(() => {
    void fetch("/api/profile").then((r) => r.json()).then((data) => setMe({ name: data?.name || "User", avatarUrl: data?.avatarUrl || null }));
  }, []);

  useEffect(() => {
    if (!peerId) return;
    const load = async () => {
      const res = await fetch(`/api/messages?peerId=${peerId}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    };
    void load();
    const timer = setInterval(load, 2500);
    return () => clearInterval(timer);
  }, [peerId]);

  useEffect(() => {
    void fetch("/api/realtime/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ online: true }),
    });
    const timer = setInterval(async () => {
      const [pRes, tRes] = await Promise.all([
        fetch("/api/realtime/presence"),
        fetch("/api/realtime/typing"),
      ]);
      const pData = await pRes.json();
      const tData = await tRes.json();
      const pMap: Record<string, boolean> = {};
      if (Array.isArray(pData)) {
        for (const p of pData) pMap[p.userId] = Boolean(p.online);
      }
      setPresence(pMap);
      if (Array.isArray(tData)) setTypingKeys(tData.map((t) => t.key));
    }, 2500);
    return () => {
      clearInterval(timer);
      void fetch("/api/realtime/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online: false }),
      });
    };
  }, []);

  const peer = useMemo(() => users.find((u) => u.id === peerId), [users, peerId]);
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);
  const peerTyping = typingKeys.includes(`${peerId}:${currentUserId}`);

  return (
    <div className="grid min-h-screen md:grid-cols-[320px_1fr]">
      <aside className="flex min-h-screen flex-col border-r border-slate-800/60 bg-[#030d22]/85 p-4 backdrop-blur-md md:p-5">
        <div className="rounded-2xl border border-slate-800/80 bg-[#051430]/75 p-5 text-center shadow-lg">
          {me?.avatarUrl ? (
            <img src={me.avatarUrl} alt="my avatar" className="mx-auto h-16 w-16 rounded-full border-2 border-cyan-500/50 object-cover shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse" />
          ) : (
            <div className="mx-auto h-16 w-16 rounded-full border-2 border-slate-700 bg-slate-800/80 flex items-center justify-center text-slate-300 font-semibold shadow-[0_0_8px_rgba(0,0,0,0.5)]">
              {me?.name?.slice(0, 1).toUpperCase() || "U"}
            </div>
          )}
          <h2 className="mt-3 text-lg font-bold tracking-tight text-white">Secure Workspace</h2>
          <p className="mt-0.5 text-xs text-slate-400 font-medium">Active user: <span className="text-[#3ea0ff]">{me?.name || "Syncrypt User"}</span></p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts..."
            className="mt-4 h-9 w-full rounded-lg border border-slate-800 bg-[#020b1c] px-3.5 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-[#1e5eb8]/80 focus:ring-1 focus:ring-[#1e5eb8]/30 transition-all"
          />
        </div>

        <div className="mt-5 flex-1 overflow-y-auto space-y-2">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">Conversations</p>
          {filteredUsers.map((u) => {
            const isOnline = Boolean(presence[u.id]);
            const isSelected = peerId === u.id;
            return (
              <button
                key={u.id}
                onClick={() => setPeerId(u.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left border transition-all duration-200 ${
                  isSelected
                    ? "border-[#1c55a6]/60 bg-[linear-gradient(135deg,#071e42_0%,#031026_100%)] text-white shadow-[0_4px_12px_rgba(28,85,166,0.18)]"
                    : "border-transparent bg-[#040e21]/40 text-slate-300 hover:border-slate-850 hover:bg-[#071633]/60 hover:text-white"
                }`}
              >
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt={u.name} className="h-9 w-9 rounded-full object-cover border border-slate-800" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-400 border border-slate-800">
                    {u.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold tracking-wide truncate">{u.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" : "bg-slate-600"}`} />
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isOnline ? "Online" : "Offline"} {u.isVerified ? "· Verified" : ""}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
          {users.length === 0 ? <p className="p-2 text-xs text-slate-500">No contacts found.</p> : null}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-900 flex items-center justify-between gap-3">
          <Link href="/settings" className="flex-1 inline-flex h-9 items-center justify-center rounded-lg border border-slate-800 bg-[#07152d] px-3 text-xs font-semibold text-slate-300 hover:bg-[#0a1e3e] hover:text-white transition-colors">
            Settings
          </Link>
          <button onClick={() => void signOut({ callbackUrl: "/login" })} className="flex-1 h-9 rounded-lg bg-rose-950/40 border border-rose-900/35 hover:bg-rose-900/30 hover:border-rose-800/40 text-rose-300 px-3 text-xs font-semibold transition-colors">
            Logout
          </button>
        </div>
      </aside>

      <section className="flex flex-col bg-[#020715]/45 p-4 md:p-6 backdrop-blur-[2px]">
        {!peer ? (
          <div className="m-auto text-center max-w-sm p-6 rounded-2xl border border-slate-850/40 bg-[#051129]/65 backdrop-blur-md shadow-2xl flex flex-col items-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/25 bg-[#08224d]/40 text-cyan-400 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.12)]">
              <Shield size={24} className="animate-pulse" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">SynCrypt Secure Chat</h1>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed text-center">
              Establish a zero-trust, end-to-end encrypted messaging session. Select any contact from the list to begin securely communicating.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-xl border border-slate-800/80 bg-[#051430]/75 px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                {peer.avatarUrl ? (
                  <img src={peer.avatarUrl} alt={peer.name} className="h-10 w-10 rounded-full object-cover border border-slate-800" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold text-slate-400 border border-slate-800">
                    {peer.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-white leading-tight">{peer.name}</p>
                    {peer.isVerified && <span className="text-[9px] bg-cyan-950/80 text-cyan-300 border border-cyan-900/60 px-1.5 py-0.5 rounded-full font-semibold">Verified</span>}
                  </div>
                  <p className="text-[10px] text-[#3ea0ff] flex items-center gap-1 mt-0.5 font-medium">
                    <Lock size={9} className="text-[#3ea0ff]" />
                    {peerTyping ? "Typing..." : "End-to-End Encrypted"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!peerId) return;
                  await fetch(`/api/messages?peerId=${peerId}`, { method: "DELETE" });
                  setMessages([]);
                }}
                className="rounded-lg border border-rose-950 bg-rose-950/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/30 hover:border-rose-900/40 transition-colors"
              >
                Clear Chat
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-850 bg-[#020b1c]/30 p-4 shadow-inner mb-4 flex flex-col">
              {messages.map((m) => {
                const mine = m.senderId === currentUserId;
                const senderName = mine ? "You" : peer.name;
                return (
                  <div key={m.id} className={`flex items-start gap-2.5 ${mine ? "justify-end" : "justify-start"}`}>
                    {!mine && (
                      peer.avatarUrl ? (
                        <img src={peer.avatarUrl} alt={peer.name} className="h-7 w-7 rounded-full object-cover border border-slate-800 mt-0.5" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-semibold text-slate-400 border border-slate-800 mt-0.5">
                          {peer.name.slice(0, 1).toUpperCase()}
                        </div>
                      )
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-sm border ${
                      mine 
                        ? "bg-[linear-gradient(135deg,#0c479e_0%,#093475_100%)] border-[#1b5cb8]/30 text-white rounded-tr-none" 
                        : "bg-[#08152e] border-slate-800/80 text-slate-100 rounded-tl-none"
                    }`}>
                      <p className={`mb-1 text-[9px] font-bold uppercase tracking-wider ${mine ? "text-cyan-300" : "text-slate-400"}`}>
                        {senderName}
                      </p>
                      <p className="text-xs leading-relaxed break-words">{m.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1.5 text-[8px] text-slate-400 font-mono">
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>·</span>
                        <span className="capitalize">{m.status}</span>
                      </div>
                    </div>
                    {mine && (
                      me?.avatarUrl ? (
                        <img src={me.avatarUrl} alt="Me" className="h-7 w-7 rounded-full object-cover border border-slate-800 mt-0.5" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-semibold text-slate-400 border border-slate-800 mt-0.5">
                          {me?.name?.slice(0, 1).toUpperCase() || "U"}
                        </div>
                      )
                    )}
                  </div>
                );
              })}
              {peerTyping ? (
                <div className="flex items-end gap-2.5">
                  {peer.avatarUrl ? (
                    <img src={peer.avatarUrl} alt={peer.name} className="h-7 w-7 rounded-full object-cover border border-slate-800" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-semibold text-slate-400 border border-slate-800">
                      {peer.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1 rounded-full bg-slate-850 px-3.5 py-2 border border-slate-800/40 shadow-sm">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                  </div>
                </div>
              ) : null}
            </div>

            <form
              className="flex flex-col gap-3 rounded-xl border border-slate-800/85 bg-[#051430]/75 p-4 shadow-lg"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!peerId || !content.trim()) return;
                setSending(true);
                await fetch("/api/messages", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ recipientId: peerId, content: content.trim(), ttlSeconds: Number(ttl) > 0 ? Number(ttl) : undefined }),
                });
                setContent("");
                setSending(false);
                const res = await fetch(`/api/messages?peerId=${peerId}`);
                const data = await res.json();
                setMessages(Array.isArray(data) ? data : []);
              }}
            >
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (peerId) {
                    void fetch("/api/realtime/typing", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ peerId, typing: e.target.value.trim().length > 0 }),
                    });
                  }
                }}
                className="min-h-16 rounded-lg border border-slate-800 bg-[#020b1c] p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-[#1e5eb8]/80 outline-none transition-all resize-none"
                placeholder={`Type a secure message for ${peer.name}...`}
                required
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Auto-Destruct:</span>
                  <select value={ttl} onChange={(e) => setTtl(e.target.value)} className="rounded-lg border border-slate-800 bg-[#020b1c] px-2.5 py-1 text-xs text-slate-300 font-medium outline-none focus:border-[#1e5eb8]/60 transition-colors">
                    <option value="0">Disabled</option>
                    <option value="300">5 Minutes</option>
                    <option value="1800">30 Minutes</option>
                    <option value="3600">1 Hour</option>
                  </select>
                </div>
                <button disabled={!peerId || sending || !content.trim()} className="inline-flex items-center gap-1.5 h-8 rounded-lg bg-[#1557cf] hover:bg-[#1a64e8] disabled:opacity-40 disabled:hover:bg-[#1557cf] text-xs font-bold text-white px-4 transition-all shadow-[0_4px_12px_rgba(21,87,207,0.3)]">
                  {sending ? "Sending..." : "Send Secure"}
                  <Send size={11} />
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
