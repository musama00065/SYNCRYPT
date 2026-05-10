import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendOtpEmail(email: string, code: string, purpose: "activation" | "login") {
  if (!resend) {
    console.log(`[SynCrypt OTP:${purpose}] ${email} => ${code}`);
    return;
  }

  await resend.emails.send({
    from: process.env.OTP_FROM_EMAIL || "SynCrypt <onboarding@resend.dev>",
    to: email,
    subject: purpose === "activation" ? "Verify your SynCrypt account" : "Your SynCrypt login code",
    html: `<p>Your SynCrypt OTP is <strong>${code}</strong>.</p><p>This code expires in 10 minutes.</p>`,
  });
}
