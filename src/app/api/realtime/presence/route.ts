import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPresence, setPresence } from "@/lib/realtime-memory";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getPresence());
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  setPresence(session.user.id, Boolean(body.online));
  return NextResponse.json({ ok: true });
}
