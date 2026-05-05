/**
 * Mock auth - simple credential check. No real JWT/sessions.
 * Demo: admin@alphabank.com / admin123, john@example.com / pass123
 */
import { mockUsers } from "./mockData";

const MOCK_PASSWORDS: Record<string, string> = {
  "admin@alphabank.com": "admin123",
  "john@example.com": "pass123",
  "1041430848": "admin123",  // account number login
  "1043345995": "pass123"
};

export function verifyMockLogin(login: string, password: string): { id: number; email: string } | null {
  const user = mockUsers.find(
    (u) => u.email.toLowerCase() === login.toLowerCase() || u.bankNumber === login
  );
  if (!user) return null;
  const expected = MOCK_PASSWORDS[user.email] || MOCK_PASSWORDS[user.bankNumber];
  if (password !== expected) return null;
  return { id: user.id, email: user.email };
}
