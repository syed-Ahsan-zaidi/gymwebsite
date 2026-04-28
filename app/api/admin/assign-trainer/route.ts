export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { memberId, trainerId } = await req.json();

    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: { trainerId: trainerId || null },
    });

    return NextResponse.json({ message: "Trainer assigned!", member: updatedMember.name });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
