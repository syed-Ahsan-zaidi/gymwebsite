export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id as string | undefined;
    const role = session.user.role;
    if (!userId) {
      return NextResponse.json({ error: "Session user id missing" }, { status: 401 });
    }

    const page = Math.max(Number.parseInt(new URL(request.url).searchParams.get("page") || "1", 10) || 1, 1);
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    if (role === "TRAINER") {
      const trainer = await prisma.trainer.findUnique({ where: { userId }, select: { id: true } });
      if (!trainer) return NextResponse.json({ error: "Trainer profile missing" }, { status: 404 });

      const where = { trainerId: trainer.id };
      const [total, classes] = await Promise.all([
        prisma.groupClass.count({ where }),
        prisma.groupClass.findMany({
          where,
          select: {
            id: true,
            title: true,
            classType: true,
            startTime: true,
            endTime: true,
            capacity: true,
            _count: {
              select: {
                enrollments: {
                  where: { status: "ENROLLED" },
                },
              },
            },
          },
          orderBy: { startTime: "asc" },
          skip,
          take: pageSize,
        }),
      ]);

      return NextResponse.json({
        classes: classes.map((groupClass) => ({
          ...groupClass,
          enrolledCount: groupClass._count.enrollments,
          isEnrolled: false,
        })),
        pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
      });
    }

    if (role === "MEMBER") {
      const member = await prisma.member.findUnique({
        where: { userId },
        select: { id: true, trainerId: true },
      });
      if (!member) return NextResponse.json({ error: "Member profile missing" }, { status: 404 });

      const where = {
        isActive: true,
        ...(member.trainerId ? { trainerId: member.trainerId } : {}),
      };

      const [total, classes] = await Promise.all([
        prisma.groupClass.count({ where }),
        prisma.groupClass.findMany({
          where,
          select: {
            id: true,
            title: true,
            classType: true,
            startTime: true,
            endTime: true,
            capacity: true,
            trainer: { select: { id: true, name: true } },
            _count: {
              select: {
                enrollments: {
                  where: { status: "ENROLLED" },
                },
              },
            },
          },
          orderBy: { startTime: "asc" },
          skip,
          take: pageSize,
        }),
      ]);

      const classIds = classes.map((groupClass) => groupClass.id);
      const memberEnrollments = classIds.length
        ? await prisma.groupClassEnrollment.findMany({
            where: {
              memberId: member.id,
              classId: { in: classIds },
              status: "ENROLLED",
            },
            select: { classId: true },
          })
        : [];
      const enrolledClassIds = new Set(memberEnrollments.map((entry) => entry.classId));

      return NextResponse.json({
        classes: classes.map((groupClass) => ({
          ...groupClass,
          enrolledCount: groupClass._count.enrollments,
          isEnrolled: enrolledClassIds.has(groupClass.id),
        })),
        memberId: member.id,
        pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
      });
    }

    return NextResponse.json({ error: "Unsupported role" }, { status: 403 });
  } catch (error) {
    console.error("GET /api/classes failed", error);
    return NextResponse.json({ error: "Failed to load classes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TRAINER") {
    return NextResponse.json({ error: "Only trainer can create classes" }, { status: 403 });
  }

  const trainer = await prisma.trainer.findUnique({
    where: { userId: (session.user as any).id },
    select: { id: true },
  });
  if (!trainer) return NextResponse.json({ error: "Trainer profile missing" }, { status: 404 });

  const body = await request.json();
  const title = String(body.title || "").trim();
  const classType = String(body.classType || "").trim();
  const startTime = new Date(body.startTime);
  const endTime = new Date(body.endTime);
  const capacity = Number(body.capacity);

  if (!title || !classType || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return NextResponse.json({ error: "Invalid class payload" }, { status: 400 });
  }
  if (startTime >= endTime || !Number.isFinite(capacity) || capacity < 1) {
    return NextResponse.json({ error: "Invalid class timings/capacity" }, { status: 400 });
  }

  const conflict = await prisma.groupClass.findFirst({
    where: {
      trainerId: trainer.id,
      isActive: true,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  if (conflict) {
    return NextResponse.json({ error: "Class overlaps with another class" }, { status: 409 });
  }

  const created = await prisma.groupClass.create({
    data: {
      trainerId: trainer.id,
      title,
      classType,
      startTime,
      endTime,
      capacity,
      isActive: true,
    },
  });

  return NextResponse.json({ class: created }, { status: 201 });
}
