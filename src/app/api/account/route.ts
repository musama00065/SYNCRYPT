import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.$transaction([
    prisma.securityEvent.deleteMany({ where: { userId: session.user.id } }),
    prisma.device.deleteMany({ where: { userId: session.user.id } }),
    prisma.session.deleteMany({ where: { userId: session.user.id } }),
    prisma.account.deleteMany({ where: { userId: session.user.id } }),
    prisma.message.deleteMany({ where: { senderId: session.user.id } }),
    prisma.user.delete({ where: { id: session.user.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
