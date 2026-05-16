import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { decryptMessage, encryptMessage } from "@/lib/crypto";
import { z } from "zod";

const sendSchema = z.object({
  recipientId: z.string().min(1),
  content: z.string().min(1).max(4000),
  ttlSeconds: z.number().int().min(30).max(60 * 60 * 24).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const peerId = req.nextUrl.searchParams.get("peerId");
  const where = peerId
    ? {
        OR: [
          { senderId: session.user.id, recipientId: peerId },
          { senderId: peerId, recipientId: session.user.id },
        ],
      }
    : {
        OR: [{ recipientId: session.user.id }, { senderId: session.user.id }],
      };

  const messages = await prisma.message.findMany({
    where: {
      ...where,
      destroyedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  const payload = messages.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    recipientId: m.recipientId,
    status: m.status,
    createdAt: m.createdAt,
    deliveredAt: m.deliveredAt,
    readAt: m.readAt,
    expiresAt: m.expiresAt,
    content: decryptMessage({
      cipherText: m.cipherText,
      iv: m.iv,
      authTag: m.authTag,
      algorithm: m.algorithm,
    }),
  }));
  return NextResponse.json(payload);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip, 20).ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const encrypted = encryptMessage(parsed.data.content);
  const now = new Date();
  const expiresAt = parsed.data.ttlSeconds ? new Date(now.getTime() + parsed.data.ttlSeconds * 1000) : null;

  const created = await prisma.message.create({
    data: {
      senderId: session.user.id,
      recipientId: parsed.data.recipientId,
      cipherText: encrypted.cipherText,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      algorithm: encrypted.algorithm,
      status: "delivered",
      deliveredAt: now,
      expiresAt,
    },
  });

  await prisma.securityEvent.create({
    data: {
      userId: session.user.id,
      type: "message_sent_encrypted",
      severity: "info",
      ip,
      meta: JSON.stringify({ recipientId: parsed.data.recipientId }),
    },
  });

  return NextResponse.json({ id: created.id, status: created.status, createdAt: created.createdAt });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const peerId = req.nextUrl.searchParams.get("peerId");
  if (!peerId) return NextResponse.json({ error: "Missing peerId" }, { status: 400 });

  const now = new Date();
  await prisma.message.updateMany({
    where: {
      destroyedAt: null,
      OR: [
        { senderId: session.user.id, recipientId: peerId },
        { senderId: peerId, recipientId: session.user.id },
      ],
    },
    data: { destroyedAt: now },
  });

  return NextResponse.json({ ok: true });
}
