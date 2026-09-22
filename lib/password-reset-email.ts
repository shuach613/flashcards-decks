import "server-only";

const resetUrlBase = () =>
  (process.env.APP_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "").replace(
    /\/$/,
    ""
  );

export async function sendPasswordResetEmail(email: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const appUrl = resetUrlBase();

  if (!apiKey || !from || !appUrl) {
    throw new Error(
      "Password reset email is not configured. Set RESEND_API_KEY, RESEND_FROM, and APP_URL."
    );
  }

  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Reset your Flashcard Decks password",
      text: [
        "We received a request to reset your password.",
        "",
        `Open this link to choose a new password: ${resetUrl}`,
        "",
        "This link expires in one hour. If you did not request this, you can ignore this email.",
      ].join("\n"),
      html: `<p>We received a request to reset your password.</p><p><a href="${resetUrl}">Choose a new password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p>`,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Password reset email failed: ${response.status} ${details}`);
  }
}
