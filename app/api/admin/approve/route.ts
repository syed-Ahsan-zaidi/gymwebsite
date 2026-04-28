export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Security Check: Sirf Admin hi approve kar sakta hai
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { memberId } = await req.json();

    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days from now
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    return NextResponse.json({ error: "Approval failed" }, { status: 500 });
  }
}
