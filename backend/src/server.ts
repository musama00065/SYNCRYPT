import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./lib/prisma.js";
import { encryptMessage, decryptMessage } from "./lib/crypto.js";
import { generateOtpCode, hashOtp, verifyOtp } from "./lib/otp.js";
import { sendOtpEmail } from "./lib/mailer.js";
import { rateLimit } from "./lib/rate-limit.js";
import { setPresence, getPresence, setTyping, getTyping } from "./lib/realtime-memory.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "syncrypt-jwt-secret-dev";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Standard cross-origin cookie configuration
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
};

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Rate Limiter Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || "127.0.0.1";
  const rl = rateLimit(ip);
  if (!rl.ok) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }
  next();
});

// Auth Middleware
export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string };
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies.syncrypt_token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized access" });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
}

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString(), service: "SynCrypt API" });
});

// Auth Routes
app.post("/api/auth/register", async (req: Request, res: Response) => {
  const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid registration input" });
    return;
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const code = generateOtpCode();
  const emailOtpHash = await hashOtp(code);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      isVerified: false,
      emailOtpHash,
      otpExpiresAt,
      otpAttempts: 0,
      otpLastSentAt: new Date(),
    },
  });

  await sendOtpEmail(parsed.data.email, code, "activation");
  res.json({ ok: true, email: parsed.data.email });
});

app.post("/api/auth/verify-otp", async (req: Request, res: Response) => {
  const schema = z.object({ email: z.string().email(), otp: z.string().length(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid OTP payload" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.emailOtpHash || !user.otpExpiresAt) {
    res.status(400).json({ error: "No pending verification found" });
    return;
  }

  if (user.otpExpiresAt.getTime() < Date.now()) {
    res.status(400).json({ error: "OTP expired. Request a new one." });
    return;
  }

  const ok = await verifyOtp(parsed.data.otp, user.emailOtpHash);
  if (!ok) {
    await prisma.user.update({ where: { id: user.id }, data: { otpAttempts: { increment: 1 } } });
    res.status(400).json({ error: "Invalid OTP code" });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, emailOtpHash: null, otpExpiresAt: null, otpAttempts: 0 },
  });

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "8h" });
  res.cookie("syncrypt_token", token, cookieOptions);
  res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid login credentials" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.isVerified) {
    res.status(401).json({ error: "Account not verified or does not exist" });
    return;
  }

  const match = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!match) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "8h" });
  res.cookie("syncrypt_token", token, cookieOptions);

  await prisma.securityEvent.create({
    data: {
      userId: user.id,
      type: "user_login_success",
      severity: "info",
      ip: req.ip || "127.0.0.1",
      meta: JSON.stringify({ email: user.email }),
    },
  });

  res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
});

app.post("/api/auth/logout", (req: Request, res: Response) => {
  res.clearCookie("syncrypt_token", cookieOptions);
  res.json({ ok: true, message: "Logged out successfully" });
});

// User & Profile Routes
app.get("/api/users/me", requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      bio: true,
      theme: true,
      notifyMessages: true,
      notifySecurity: true,
      privacyReadReceipts: true,
      privacyOnlineStatus: true,
      privacyMessageRequests: true,
      createdAt: true,
    },
  });
  res.json({ user });
});

app.get("/api/users", requireAuth, async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    where: { id: { not: req.user!.id } },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });
  res.json({ users });
});

// Messages Routes
app.post("/api/messages", requireAuth, async (req: AuthRequest, res: Response) => {
  const schema = z.object({ recipientId: z.string(), text: z.string().min(1), expiresMinutes: z.number().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid message payload" });
    return;
  }

  const enc = encryptMessage(parsed.data.text);
  const expiresAt = parsed.data.expiresMinutes ? new Date(Date.now() + parsed.data.expiresMinutes * 60 * 1000) : null;

  const msg = await prisma.message.create({
    data: {
      senderId: req.user!.id,
      recipientId: parsed.data.recipientId,
      cipherText: enc.cipherText,
      iv: enc.iv,
      authTag: enc.authTag,
      algorithm: enc.algorithm,
      expiresAt,
    },
  });

  res.json({ ok: true, message: { ...msg, decryptedText: parsed.data.text } });
});

app.get("/api/messages", requireAuth, async (req: AuthRequest, res: Response) => {
  const recipientId = req.query.recipientId as string;
  const whereClause = recipientId
    ? {
        OR: [
          { senderId: req.user!.id, recipientId },
          { senderId: recipientId, recipientId: req.user!.id },
        ],
      }
    : {
        OR: [{ senderId: req.user!.id }, { recipientId: req.user!.id }],
      };

  const messages = await prisma.message.findMany({
    where: whereClause,
    orderBy: { createdAt: "asc" },
  });

  const decrypted = messages.map((m) => ({
    ...m,
    decryptedText: decryptMessage({ cipherText: m.cipherText, iv: m.iv, authTag: m.authTag, algorithm: m.algorithm }),
  }));

  res.json({ messages: decrypted });
});

// Devices & Security Routes
app.get("/api/devices", requireAuth, async (req: AuthRequest, res: Response) => {
  const devices = await prisma.device.findMany({ where: { userId: req.user!.id } });
  res.json({ devices });
});

app.get("/api/security/events", requireAuth, async (req: AuthRequest, res: Response) => {
  const events = await prisma.securityEvent.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  res.json({ events });
});

// Realtime Presence & Typing
app.post("/api/realtime/presence", requireAuth, (req: AuthRequest, res: Response) => {
  setPresence(req.user!.id, true);
  res.json({ ok: true, presence: getPresence() });
});

app.get("/api/realtime/presence", requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ presence: getPresence() });
});

app.listen(PORT, () => {
  console.log(`🔒 SynCrypt API Server running on port ${PORT}`);
});
