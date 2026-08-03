import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function NavBar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="border-b border-sand bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/msit-logomark.svg" alt="" width={28} height={10} priority />
          <span className="font-semibold text-evergreen">Flashcard Decks</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="font-medium text-evergreen underline-offset-4 hover:underline"
            >
              Admin
            </Link>
          )}
          {user ? (
            <>
              <span className="text-dark-gray">{user.email}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  className="rounded-full border border-evergreen/20 px-4 py-1.5 font-medium text-evergreen transition hover:bg-evergreen hover:text-white"
                  type="submit"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-medium text-evergreen underline-offset-4 hover:underline"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-evergreen px-4 py-1.5 font-medium text-white transition hover:brightness-110"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
