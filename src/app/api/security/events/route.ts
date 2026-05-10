import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const events = await prisma.securityEvent.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const event = await prisma.securityEvent.create({
    data: {
      userId: session?.user?.id,
      type: body.type ?? "activity",
      severity: body.severity ?? "info",
      ip: req.headers.get("x-forwarded-for") ?? "unknown",
      meta: body.meta ? JSON.stringify(body.meta) : null,
    },
  });
  return NextResponse.json(event);
}
