import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

/** Generate a random 6-digit numeric code (for system-generated transfer codes). */
export function generateCode(length = 6): string {
  const digits = "0123456789";
  let out = "";
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    out += digits[bytes[i]! % 10];
  }
  return out;
}

/** Generate a random code and its hash. Use when creating or rotating transfer codes. */
export function generateAndHashCode(length = 6): { plain: string; hash: string } {
  const plain = generateCode(length);
  return { plain, hash: hashCode(plain) };
}

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
