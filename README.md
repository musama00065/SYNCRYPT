# SynCrypt

SynCrypt is a Vercel-optimized secure real-time messaging platform built with Next.js App Router, TypeScript, Prisma, Auth.js, and PostgreSQL.

## Core Capabilities
- Secure authentication with Auth.js credentials and JWT sessions
- Password hashing with bcryptjs
- Email OTP verification for account activation and login security
- Zero-trust trusted-device and session tracking models
- Serverless REST APIs for auth, messaging, devices, files, and security events
- AES-256-GCM encrypted message persistence with secure decrypt-on-read responses
- Message expiration controls and read receipt API
- Presence and typing signal endpoints for realtime UX hooks
- Rate limiting and secure headers middleware
- Cybersecurity analytics dashboard UX
- Dark glassmorphism cyber SaaS interface with Framer Motion animations

## Architecture (Vercel-Ready)
- Frontend: Next.js App Router + Tailwind + Framer Motion
- Backend: Next.js serverless route handlers
- DB: PostgreSQL via Prisma ORM
- Realtime: designed for Supabase Realtime or Pusher integration
- File security: upload policy endpoint for Supabase Storage or Cloudinary

## Pages
- `/` landing page
- `/register` register
- `/login` login
- `/verify-otp` email OTP verification
- `/dashboard` messaging dashboard
- `/security` security analytics dashboard
- `/settings` profile & settings
- `/devices` trusted devices
- `/notifications` notification center
- `/admin` admin control panel

## API Routes
- `POST /api/auth/register`
- `GET /api/auth`
- `GET|POST /api/messages`
- `POST /api/messages/[id]/read`
- `POST /api/messages/expire`
- `GET|POST /api/devices`
- `GET|POST /api/security/events`
- `GET /api/users`
- `GET|POST /api/realtime/presence`
- `GET|POST /api/realtime/typing`
- `POST /api/files`

## Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill secrets
3. Run Prisma generate and migrations:
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
   - If prompted for migration name, use `secure-messaging-upgrade`
4. Start local server: `npm run dev`

## Deployment (Vercel)
1. Push project to GitHub
2. Import in Vercel
3. Add environment variables from `.env.example`
4. Configure a managed PostgreSQL (Neon/Supabase)
5. Deploy

## Security Model Notes
- Never expose service keys client-side
- JWT sessions with expiration and secure cookie defaults
- Input validation with Zod
- Anti-abuse controls via rate limiting and request checks
- OWASP-minded serverless architecture with strict security headers

## Threat Model (Summary)
- Brute force: mitigated by rate limiting, lockout path, and OTP attempt limits
- Credential stuffing: email OTP + login telemetry + suspicious login alerts
- Token theft: short session window and secure cookie handling
- Injection/XSS: Prisma parameterization + validation and sanitized outputs
- Device compromise: trusted-device management and revocation
