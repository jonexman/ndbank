/**
 * Email utilities. Uses Resend if RESEND_API_KEY is set, otherwise logs to console (dev).
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function sendOtpEmail(to: string, otp: string, txRef: string): Promise<boolean> {
  const subject = `Your transfer verification code: ${otp}`;
  const html = `
    <p>Your transfer verification code is: <strong>${otp}</strong></p>
    <p>Reference: ${txRef}</p>
    <p>This code expires in 10 minutes. Do not share it with anyone.</p>
  `;

  if (RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? "Alpha Bank <noreply@example.com>",
          to: [to],
          subject,
          html,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Dev fallback: log OTP so it can be used
  console.log(`[OTP Email] To: ${to}, OTP: ${otp}, Ref: ${txRef}`);
  return true;
}
