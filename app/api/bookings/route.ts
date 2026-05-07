export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

async function getContext() {
  const session = await getServerSession(authOptions);
  if (!session) return { role: null, userId: null, trainerId: null, memberId: null };

  const userId = (session.user as any).id as string;
  const role = session.user.role;
  const [trainer, member] = await Promise.all([
    prisma.trainer.findUnique({ where: { userId }, select: { id: true } }),
    prisma.member.findUnique({ where: { userId }, select: { id: true } }),
  ]);

  return { role, userId, trainerId: trainer?.id ?? null, memberId: member?.id ?? null };
}

export async function GET(request: NextRequest) {
  const context = await getContext();
  if (!context.role) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const page = Math.max(Number.parseInt(url.searchParams.get("page") || "1", 10) || 1, 1);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where =
    context.role === "TRAINER"
      ? { trainerId: context.trainerId! }
      : context.role === "MEMBER"
      ? { memberId: context.memberId! }
      : null;

  if (!where) {
    return NextResponse.json({ error: "Unsupported role for bookings" }, { status: 403 });
  }

  const [total, bookings] = await Promise.all([
    prisma.sessionBooking.count({ where }),
    prisma.sessionBooking.findMany({
      where,
      include: {
        member: { select: { id: true, name: true, user: { select: { email: true } } } },
        trainer: { select: { id: true, name: true, user: { select: { email: true } } } },
      },
      orderBy: { startTime: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    bookings,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}

export async function POST(request: NextRequest) {
  const context = await getContext();
  if (context.role !== "MEMBER" || !context.memberId) {
    return NextResponse.json({ error: "Only members can create bookings" }, { status: 403 });
  }

  const body = await request.json();
  const trainerId = body.trainerId as string;
  const slotId = body.slotId as string | undefined;
  const startTime = new Date(body.startTime);
  const endTime = new Date(body.endTime);
  const notes = body.notes ? String(body.notes) : null;

  if (!trainerId || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return NextResponse.json({ error: "Invalid booking payload" }, { status: 400 });
  }
  if (startTime >= endTime) {
    return NextResponse.json({ error: "Invalid booking times" }, { status: 400 });
  }

  if (slotId) {
    const slot = await prisma.trainerAvailabilitySlot.findFirst({
      where: { id: slotId, trainerId, isActive: true },
    });
    if (!slot) {
      return NextResponse.json({ error: "Selected slot not available" }, { status: 404 });
    }
  }

  const [overlapForMember, overlapForTrainer] = await Promise.all([
    prisma.sessionBooking.findFirst({
      where: {
        memberId: context.memberId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    }),
    prisma.sessionBooking.findFirst({
      where: {
        trainerId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    }),
  ]);

  if (overlapForMember) {
    return NextResponse.json({ error: "You already have another booking in this time range" }, { status: 409 });
  }
  if (overlapForTrainer) {
    return NextResponse.json({ error: "Trainer already has a booking in this time range" }, { status: 409 });
  }

  const booking = await prisma.sessionBooking.create({
    data: {
      trainerId,
      memberId: context.memberId,
      slotId: slotId ?? null,
      startTime,
      endTime,
      notes,
      status: BookingStatus.PENDING,
    },
  });

  return NextResponse.json({ booking }, { status: 201 });
}
