import { NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { ensureDefaultCertificates } from "@/lib/certificates-server";
import { serializeCertificate } from "@/lib/api-serialize";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  await ensureDefaultCertificates();
  const certificates = await prisma.certificate.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { decks: true } } },
  });

  return NextResponse.json({
    certificates: certificates.map(serializeCertificate),
  });
}

export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "'name' is required." }, { status: 400 });
  }

  const existing = await prisma.certificate.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json(
      { error: `A certificate named '${name}' already exists.` },
      { status: 409 }
    );
  }

  const last = await prisma.certificate.findFirst({ orderBy: { order: "desc" } });
  const certificate = await prisma.certificate.create({
    data: { name, order: (last?.order ?? -1) + 1 },
    include: { _count: { select: { decks: true } } },
  });

  return NextResponse.json(
    { certificate: serializeCertificate(certificate) },
    { status: 201 }
  );
}
