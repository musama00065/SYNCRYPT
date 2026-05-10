import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const result = await prisma.message.updateMany({
    where: {
      destroyedAt: null,
      expiresAt: { lte: now },
      OR: [{ senderId: session.user.id }, { recipientId: session.user.id }],
    },
    data: { destroyedAt: now, status: "expired" },
  });

  return NextResponse.json({ ok: true, expired: result.count });
}
