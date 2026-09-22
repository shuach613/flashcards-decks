import "server-only";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export function requireApiKey(request: Request): NextResponse | null {
  const auth = request.headers.get("authorization") ?? "";
  const [scheme, token] = auth.split(" ");
  const expected = process.env.ADMIN_API_KEY;

  const tokenBytes = token ? Buffer.from(token) : null;
  const expectedBytes = expected ? Buffer.from(expected) : null;
  const validToken =
    scheme === "Bearer" &&
    tokenBytes !== null &&
    expectedBytes !== null &&
    tokenBytes.length === expectedBytes.length &&
    timingSafeEqual(tokenBytes, expectedBytes);

  if (!validToken) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }
  return null;
}
