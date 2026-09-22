import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto mt-16 max-w-sm px-6">
      <div className="rounded-2xl border border-sand bg-white p-8 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-evergreen">
          Choose a new password
        </h1>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <>
            <p className="mb-6 text-sm text-dark-gray">
              This reset link is invalid or has expired.
            </p>
            <Link
              className="font-medium text-evergreen underline underline-offset-4"
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
