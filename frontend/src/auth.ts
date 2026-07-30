import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

const creds = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  otp: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, otp: {} },
      authorize: async (input) => {
        const parsed = creds.safeParse(input);
        if (!parsed.success) return null;
        try {
          const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
          });
          if (!apiRes.ok) return null;
          const data = await apiRes.json();
          return data.user || null;
        } catch {
          return null;
        }
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
