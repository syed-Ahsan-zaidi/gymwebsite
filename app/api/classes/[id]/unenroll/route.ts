export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EnrollmentStatus } from "@prisma/client";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MEMBER") {
    return NextResponse.json({ error: "Only members can unenroll" }, { status: 403 });
  }

  const member = await prisma.member.findUnique({
    where: { userId: (session.user as any).id },
    select: { id: true },
  });
  if (!member) return NextResponse.json({ error: "Member profile missing" }, { status: 404 });

  const { id } = await params;
  const enrollment = await prisma.groupClassEnrollment.findUnique({
    where: { classId_memberId: { classId: id, memberId: member.id } },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
  }

  const updated = await prisma.groupClassEnrollment.update({
    where: { id: enrollment.id },
    data: { status: EnrollmentStatus.CANCELLED },
  });

  return NextResponse.json({ enrollment: updated });
}
