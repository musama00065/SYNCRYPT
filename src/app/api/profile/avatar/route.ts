import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Image too large (max 5MB)" }, { status: 413 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: dataUrl },
    select: { avatarUrl: true },
  });

  return NextResponse.json({ ok: true, avatarUrl: user.avatarUrl });
}
