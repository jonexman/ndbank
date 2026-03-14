import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

export function hashCode(code: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(code, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyCode(code: string, storedHash: string | null | undefined): boolean {
  if (!storedHash || !code) return false;
  try {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;
    const computed = scryptSync(code, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}
