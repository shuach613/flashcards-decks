import Link from "next/link";
import { SignupForm } from "./signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const target = callbackUrl ?? "/";

  return (
    <div className="mx-auto mt-16 max-w-sm px-6">
      <h1 className="mb-6 text-2xl font-semibold">Sign up</h1>
      <SignupForm callbackUrl={target} />
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          className="underline underline-offset-4"
          href={`/login?callbackUrl=${encodeURIComponent(target)}`}
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
