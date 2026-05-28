import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOtpCode, hashOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.isVerified) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const passOk = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passOk) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < 30_000) {
    return NextResponse.json({ error: "Please wait before requesting another code" }, { status: 429 });
  }

  const code = generateOtpCode();
  const emailOtpHash = await hashOtp(code);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailOtpHash,
      otpExpiresAt,
      otpAttempts: 0,
      otpLastSentAt: new Date(),
    },
  });

  await prisma.securityEvent.create({
    data: {
      userId: user.id,
      type: "login_otp_requested",
      severity: "info",
      ip: req.headers.get("x-forwarded-for") ?? "unknown",
      meta: JSON.stringify({ email: user.email }),
    },
  });

  await sendOtpEmail(user.email, code, "login");
  return NextResponse.json({ ok: true });
}
