import crypto from "crypto";

const ALGO: crypto.CipherGCMTypes = "aes-256-gcm";

function deriveKey() {
  const raw = process.env.MSG_ENCRYPTION_KEY || process.env.AUTH_SECRET || "syncrypt-dev-key";
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptMessage(plainText: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, deriveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    cipherText: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: tag.toString("base64"),
    algorithm: ALGO,
  };
}

export function decryptMessage(payload: { cipherText: string; iv: string; authTag: string; algorithm?: string }) {
  try {
    const algorithm: crypto.CipherGCMTypes = payload.algorithm === ALGO ? ALGO : ALGO;
    const decipher = crypto.createDecipheriv(algorithm, deriveKey(), Buffer.from(payload.iv, "base64"));
    decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));
    const plain = Buffer.concat([
      decipher.update(Buffer.from(payload.cipherText, "base64")),
      decipher.final(),
    ]);
    return plain.toString("utf8");
  } catch {
    return "[Unable to decrypt]";
  }
}
