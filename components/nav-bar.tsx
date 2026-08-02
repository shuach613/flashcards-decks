import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function NavBar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold">
          Flashcard Decks
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="underline-offset-4 hover:underline">
              Admin
            </Link>
          )}
          {user ? (
            <>
              <span className="text-zinc-500 dark:text-zinc-400">{user.email}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button className="underline-offset-4 hover:underline" type="submit">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="underline-offset-4 hover:underline">
                Log in
              </Link>
              <Link href="/signup" className="underline-offset-4 hover:underline">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
