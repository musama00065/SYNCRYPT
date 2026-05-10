import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";

const schema = z.object({ email: z.string().email(), otp: z.string().length(6), purpose: z.enum(["activation", "login"]) });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.emailOtpHash || !user.otpExpiresAt) return NextResponse.json({ error: "OTP not requested" }, { status: 400 });
  if (user.otpExpiresAt.getTime() < Date.now()) return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  if (user.otpAttempts >= 5) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const ok = await verifyOtp(parsed.data.otp, user.emailOtpHash);
  if (!ok) {
    await prisma.user.update({ where: { id: user.id }, data: { otpAttempts: { increment: 1 } } });
    return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      emailOtpHash: null,
      otpExpiresAt: null,
      otpAttempts: 0,
    },
  });

  return NextResponse.json({ ok: true });
}
