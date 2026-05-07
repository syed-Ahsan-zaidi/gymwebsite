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
    return NextResponse.json({ error: "Only members can enroll" }, { status: 403 });
  }

  const member = await prisma.member.findUnique({
    where: { userId: (session.user as any).id },
    select: { id: true },
  });
  if (!member) return NextResponse.json({ error: "Member profile missing" }, { status: 404 });

  const { id } = await params;
  const groupClass = await prisma.groupClass.findUnique({
    where: { id },
    include: {
      enrollments: { where: { status: EnrollmentStatus.ENROLLED }, select: { id: true } },
    },
  });
  if (!groupClass || !groupClass.isActive) {
    return NextResponse.json({ error: "Class not available" }, { status: 404 });
  }

  const existing = await prisma.groupClassEnrollment.findUnique({
    where: { classId_memberId: { classId: id, memberId: member.id } },
  });

  if (existing?.status === EnrollmentStatus.ENROLLED) {
    return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
  }

  if (groupClass.enrollments.length >= groupClass.capacity) {
    return NextResponse.json({ error: "Class is full" }, { status: 409 });
  }

  const enrollment = existing
    ? await prisma.groupClassEnrollment.update({
        where: { id: existing.id },
        data: { status: EnrollmentStatus.ENROLLED },
      })
    : await prisma.groupClassEnrollment.create({
        data: {
          classId: id,
          memberId: member.id,
          status: EnrollmentStatus.ENROLLED,
        },
      });

  return NextResponse.json({ enrollment });
}
