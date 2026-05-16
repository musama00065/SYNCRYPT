import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  notifyMessages: z.boolean().optional(),
  notifySecurity: z.boolean().optional(),
  privacyReadReceipts: z.boolean().optional(),
  privacyOnlineStatus: z.boolean().optional(),
  privacyMessageRequests: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      theme: true,
      notifyMessages: true,
      notifySecurity: true,
      privacyReadReceipts: true,
      privacyOnlineStatus: true,
      privacyMessageRequests: true,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: {
      theme: true,
      notifyMessages: true,
      notifySecurity: true,
      privacyReadReceipts: true,
      privacyOnlineStatus: true,
      privacyMessageRequests: true,
    },
  });

  return NextResponse.json(updated);
}
