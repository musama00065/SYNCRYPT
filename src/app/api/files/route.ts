import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if ((body.size ?? 0) > MAX_BYTES) return NextResponse.json({ error: "File too large" }, { status: 413 });
  return NextResponse.json({
    ok: true,
    uploadProvider: "supabase-or-cloudinary",
    expiresIn: 300,
    virusScan: "simulated-clean",
  });
}
