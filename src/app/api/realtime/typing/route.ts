import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTyping, setTyping } from "@/lib/realtime-memory";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getTyping());
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const peerId = String(body.peerId || "");
  if (!peerId) return NextResponse.json({ error: "peerId required" }, { status: 400 });
  setTyping(`${session.user.id}:${peerId}`, Boolean(body.typing));
  return NextResponse.json({ ok: true });
}
