import "server-only";
import { NextResponse } from "next/server";

export function requireApiKey(request: Request): NextResponse | null {
  const auth = request.headers.get("authorization") ?? "";
  const [scheme, token] = auth.split(" ");
  const expected = process.env.ADMIN_API_KEY;

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }
  if (scheme !== "Bearer" || token !== expected) {
    return NextResponse.json(
      { error: "Unauthorized. Pass 'Authorization: Bearer <ADMIN_API_KEY>'." },
      { status: 401 }
    );
  }
  return null;
}
