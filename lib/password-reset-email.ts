import "server-only";
import nodemailer from "nodemailer";

const resetUrlBase = () =>
  (process.env.APP_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "").replace(
    /\/$/,
    ""
  );

export async function sendPasswordResetEmail(email: string, token: string) {
  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;
  const appUrl = resetUrlBase();

  if (!host || !Number.isFinite(port) || !user || !password || !from || !appUrl) {
    throw new Error(
      "Password reset email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, and APP_URL."
    );
  }

  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass: password },
  });

  await transporter.sendMail({
    from,
    to: email,
    subject: "Reset your ShuachCloud password",
    text: [
      "We received a request to reset your password.",
      "",
      `Open this link to choose a new password: ${resetUrl}`,
      "",
      "This link expires in one hour. If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `<p>We received a request to reset your password.</p><p><a href="${resetUrl}">Choose a new password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p>`,
  });
}
