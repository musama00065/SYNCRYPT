import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOtpCode, hashOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

const schema = z.object({ email: z.string().email(), purpose: z.enum(["activation", "login"]) });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (parsed.data.purpose === "activation" && user.isVerified) return NextResponse.json({ error: "Account already verified" }, { status: 400 });

  if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < 30_000) {
    return NextResponse.json({ error: "Please wait 30 seconds before resend" }, { status: 429 });
  }

  const code = generateOtpCode();
  const emailOtpHash = await hashOtp(code);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailOtpHash, otpExpiresAt, otpAttempts: 0, otpLastSentAt: new Date() },
  });

  await sendOtpEmail(user.email, code, parsed.data.purpose);
  return NextResponse.json({ ok: true });
}
