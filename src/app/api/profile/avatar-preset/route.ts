import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAllowedAvatarPreset } from "@/lib/avatar-presets";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const avatarUrl = String(body.avatarUrl || "");
  if (!isAllowedAvatarPreset(avatarUrl)) {
    return NextResponse.json({ error: "Invalid avatar preset" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl },
    select: { avatarUrl: true },
  });
  return NextResponse.json({ ok: true, avatarUrl: updated.avatarUrl });
}
