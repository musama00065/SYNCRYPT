import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const msg = await prisma.message.findUnique({ where: { id } });
  if (!msg || msg.recipientId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.message.update({
    where: { id },
    data: { status: "read", readAt: new Date() },
  });

  return NextResponse.json({ ok: true, id: updated.id, readAt: updated.readAt });
}
