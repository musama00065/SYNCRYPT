import { NextResponse } from "next/server";

export const GET = () => NextResponse.json({ ok: true, service: "syncrypt-auth", note: "Use /login UI with Auth.js credentials provider." });
