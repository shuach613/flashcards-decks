import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto mt-8 max-w-sm px-4 sm:mt-16 sm:px-6">
      <div className="rounded-2xl border border-neutral-muted bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)] sm:p-8">
        <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-brand-primary">
          Choose a new password
        </h1>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <>
            <p className="mb-6 text-sm text-text-muted">
              This reset link is invalid or has expired.
            </p>
            <Link
              className="font-medium text-brand-primary underline underline-offset-4"
              href="/forgot-password"
            >
              Request a new link
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
