"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

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
    <div className="grid min-h-screen md:grid-cols-[360px_1fr]">
      <aside className="flex min-h-screen flex-col border-r border-slate-700/40 bg-[#071633]/45 p-4 backdrop-blur-[2px] md:p-5">
        <div className="rounded-[2.2rem] border border-slate-700/50 bg-[#021524]/55 px-6 py-7 text-center">
          {me?.avatarUrl ? (
            <img src={me.avatarUrl} alt="my avatar" className="mx-auto h-24 w-24 rounded-full border-4 border-cyan-500/60 object-cover" />
          ) : (
            <div className="mx-auto h-24 w-24 rounded-full border-4 border-cyan-500/60 bg-slate-300" />
          )}
          <h2 className="mt-4 text-4xl font-bold leading-none">Hello</h2>
          <p className="mt-2 text-lg text-slate-300">{me?.name || "Syncrypt User"}</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="mt-6 h-12 w-full rounded-full border border-slate-700 bg-[#0f2334] px-4 text-center text-3xl"
          />
        </div>

        <div className="mt-5 grid gap-3">
          {filteredUsers.map((u) => (
            <button key={u.id} onClick={() => setPeerId(u.id)} className={`flex min-h-22 items-center gap-3 rounded-3xl px-5 py-4 text-left ${peerId === u.id ? "bg-[#c7d0d5] text-slate-900" : "bg-[#8f9ea7] text-slate-900"}`}>
              {u.avatarUrl ? <img src={u.avatarUrl} alt={u.name} className="h-12 w-12 rounded-full object-cover" /> : <div className="h-12 w-12 rounded-full bg-slate-300" />}
              <div>
                <p className="text-xl font-semibold">{u.name}</p>
                <p className="text-sm">{presence[u.id] ? "Online" : "Offline"} {u.isVerified ? "| Verified" : ""}</p>
              </div>
            </button>
          ))}
          {users.length === 0 ? <p className="p-2 text-slate-300">No users found yet.</p> : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={() => void signOut({ callbackUrl: "/login" })} className="h-11 rounded-full bg-rose-500 px-6 font-semibold text-white">Logout</button>
          <Link href="/settings" className="inline-flex h-11 items-center rounded-full bg-[#dce1e4] px-5 font-semibold text-slate-900">Settings</Link>
        </div>
      </aside>

      <section className="flex flex-col bg-[#071633]/35 p-6 backdrop-blur-[1px]">
        {!peer ? (
          <div className="m-auto text-center">
            <h1 className="text-7xl font-bold text-slate-200">Welcome to <span className="text-[#021524]">Syncro</span></h1>
            <p className="mt-4 text-4xl text-slate-200">Stay in sync with every word.</p>
          </div>
        ) : (
          <>
            <div className="mb-3 rounded-2xl border border-slate-600/45 bg-[#1f3445]/45 px-4 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xl font-semibold">Chat with {peer.name}</p>
                  <p className="text-sm text-slate-300">{peerTyping ? "Typing..." : "Secure chat active"}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!peerId) return;
                    await fetch(`/api/messages?peerId=${peerId}`, { method: "DELETE" });
                    setMessages([]);
                  }}
                  className="self-start rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 transition hover:bg-rose-500/20"
                >
                  Clear chat
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-auto rounded-2xl border border-slate-600/45 bg-[#1d3142]/35 p-4">
              {messages.map((m) => {
                const mine = m.senderId === currentUserId;
                const sender = mine ? me : users.find((u) => u.id === m.senderId);
                return (
                  <div key={m.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                    {!mine ? (
                      sender?.avatarUrl ? (
                        <img src={sender.avatarUrl} alt={sender?.name || "User"} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-300" />
                      )
                    ) : null}
                    <div className={`max-w-[75%] rounded-xl px-3 py-2 ${mine ? "bg-cyan-500/30" : "bg-slate-700"}`}>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300/90">
                        {mine ? "You" : (sender?.name || "User")}
                      </p>
                      <p>{m.content}</p>
                      <p className="mt-1 text-xs text-slate-300">{new Date(m.createdAt).toLocaleTimeString()} | {m.status}</p>
                    </div>
                    {mine ? (
                      sender?.avatarUrl ? (
                        <img src={sender.avatarUrl} alt={sender?.name || "Me"} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-300" />
                      )
                    ) : null}
                  </div>
                );
              })}
              {peerTyping ? (
                <div className="flex items-end gap-2">
                  {peer?.avatarUrl ? (
                    <img src={peer.avatarUrl} alt={peer.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-300" />
                  )}
                  <div className="inline-flex items-center gap-1 rounded-2xl bg-slate-700 px-3 py-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-200 [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-200 [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-200" />
                  </div>
                </div>
              ) : null}
            </div>

            <form
              className="mt-3 flex flex-col gap-2 rounded-2xl border border-slate-600/45 bg-[#1f3445]/40 p-3"
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
                className="min-h-24 rounded-xl border border-slate-600 bg-[#2a4153] p-3"
                placeholder="Write message..."
              />
              <div className="flex items-center gap-2">
                <select value={ttl} onChange={(e) => setTtl(e.target.value)} className="rounded-xl border border-slate-600 bg-[#2a4153] px-3 py-2 text-sm">
                  <option value="0">No expiry</option>
                  <option value="300">5 min</option>
                  <option value="1800">30 min</option>
                  <option value="3600">1 hour</option>
                </select>
                <button disabled={!peerId || sending} className="rounded-xl bg-[#dce1e4] px-5 py-2 text-lg font-semibold text-slate-900 disabled:opacity-60">{sending ? "Sending..." : "Send"}</button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
