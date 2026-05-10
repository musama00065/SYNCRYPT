import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";

const creds = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  otp: z.string().length(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, otp: {} },
      authorize: async (input) => {
        const parsed = creds.safeParse(input);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || !user.isVerified || !user.emailOtpHash || !user.otpExpiresAt) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        if (user.otpExpiresAt.getTime() < Date.now()) return null;
        if (user.otpAttempts >= 5) return null;

        const otpOk = await verifyOtp(parsed.data.otp, user.emailOtpHash);
        if (!otpOk) {
          await prisma.user.update({
            where: { id: user.id },
            data: { otpAttempts: { increment: 1 } },
          });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { emailOtpHash: null, otpExpiresAt: null, otpAttempts: 0 },
        });

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.sub = user.id as string;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) session.user.id = token.sub ?? "";
      return session;
    },
  },
  trustHost: true,
});
