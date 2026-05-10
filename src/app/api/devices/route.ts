import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const devices = await prisma.device.findMany({ where: { userId: session.user.id }, orderBy: { lastSeenAt: "desc" } });
  return NextResponse.json(devices);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const device = await prisma.device.create({
    data: {
      userId: session.user.id,
      label: body.label,
      fingerprint: body.fingerprint,
      trusted: Boolean(body.trusted),
    },
  });
  return NextResponse.json(device);
}
