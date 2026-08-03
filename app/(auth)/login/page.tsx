import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const target = callbackUrl ?? "/";

  return (
    <div className="mx-auto mt-16 max-w-sm px-6">
      <div className="rounded-2xl border border-sand bg-white p-8 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-evergreen">
          Log in
        </h1>
        <LoginForm callbackUrl={target} />
      </div>
      <p className="mt-4 text-center text-sm text-dark-gray">
        No account?{" "}
        <Link
          className="font-medium text-evergreen underline underline-offset-4"
          href={`/signup?callbackUrl=${encodeURIComponent(target)}`}
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
