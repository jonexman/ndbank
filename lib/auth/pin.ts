import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPin(pin: string, pinHash: string | null | undefined): boolean {
  if (!pinHash || !pin) return false;
  try {
    const [salt, storedHash] = pinHash.split(":");
    if (!salt || !storedHash) return false;
    const hash = scryptSync(pin, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}
