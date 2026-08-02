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
      <h1 className="mb-6 text-2xl font-semibold">Log in</h1>
      <LoginForm callbackUrl={target} />
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        No account?{" "}
        <Link
          className="underline underline-offset-4"
          href={`/signup?callbackUrl=${encodeURIComponent(target)}`}
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
