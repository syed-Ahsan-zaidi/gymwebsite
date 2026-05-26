export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function resolveWeekday(dateValue: Date) {
  return dateValue.getUTCDay();
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TRAINER" && session.user.role !== "MEMBER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Session user id missing" }, { status: 401 });
    }

    let trainerProfile: { id: string } | null = null;
    if (session.user.role === "TRAINER") {
      trainerProfile = await prisma.trainer.findUnique({
        where: { userId },
        select: { id: true },
      });
    } else {
      const member = await prisma.member.findUnique({
        where: { userId },
        select: { trainerId: true },
      });
      if (member?.trainerId) {
        trainerProfile = { id: member.trainerId };
      }
    }

    if (!trainerProfile) {
      return NextResponse.json({ error: "Trainer profile missing" }, { status: 404 });
    }

    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    const slots = await prisma.trainerAvailabilitySlot.findMany({
      where: {
        trainerId: trainerProfile.id,
        isActive: true,
        ...(fromDate && toDate
          ? {
              OR: [
                {
                  isRecurring: false,
                  endTime: { gt: fromDate, lte: toDate },
                },
                {
                  isRecurring: true,
                },
              ],
            }
          : {}),
      },
      orderBy: { startTime: "asc" },
    });

    if (!fromDate || !toDate) {
      return NextResponse.json({ slots });
    }

    const expandedSlots = slots.flatMap((slot) => {
      if (!slot.isRecurring) return [slot];

      const baseStart = new Date(slot.startTime);
      const baseEnd = new Date(slot.endTime);

      // For recurring slots use only the time-of-day difference (ignore date gap)
      const startMins = baseStart.getUTCHours() * 60 + baseStart.getUTCMinutes();
      const endMins = baseEnd.getUTCHours() * 60 + baseEnd.getUTCMinutes();
      let durationMins = endMins - startMins;
      if (durationMins <= 0) durationMins += 24 * 60; // overnight slot
      const slotDurationMs = durationMins * 60 * 1000;

      // Only generate the FIRST upcoming occurrence for recurring slots
      const current = new Date(fromDate);
      while (current <= toDate) {
        if (resolveWeekday(current) === slot.weekday) {
          const start = new Date(current);
          start.setUTCHours(baseStart.getUTCHours(), baseStart.getUTCMinutes(), 0, 0);
          const end = new Date(start.getTime() + slotDurationMs);
          return [{
            ...slot,
            generatedStartTime: start.toISOString(),
            generatedEndTime: end.toISOString(),
          }];
        }
        current.setUTCDate(current.getUTCDate() + 1);
      }
      return [];
    });

    // Fetch existing PENDING/CONFIRMED bookings for this trainer in the date range
    const bookedSlots = await prisma.sessionBooking.findMany({
      where: {
        trainerId: trainerProfile.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: { lt: toDate },
        endTime: { gt: fromDate },
      },
      select: { startTime: true, endTime: true },
    });

    // If MEMBER: also fetch their own PENDING/CONFIRMED booked slotIds to hide recurring occurrences
    let memberBookedSlotIds = new Set<string>();
    if (session.user.role === "MEMBER") {
      const memberProfile = await prisma.member.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (memberProfile) {
        const memberBookings = await prisma.sessionBooking.findMany({
          where: {
            memberId: memberProfile.id,
            status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
            slotId: { not: null },
          },
          select: { slotId: true },
        });
        for (const b of memberBookings) {
          if (b.slotId) memberBookedSlotIds.add(b.slotId);
        }
      }
    }

    // Remove slots that overlap with any existing booking OR already booked by this member
    const availableSlots = expandedSlots.filter((slot) => {
      const slotStart = new Date((slot.generatedStartTime ?? slot.startTime) as string);
      const slotEnd = new Date((slot.generatedEndTime ?? slot.endTime) as string);
      const trainerConflict = bookedSlots.some(
        (b) => new Date(b.startTime) < slotEnd && new Date(b.endTime) > slotStart
      );
      const memberAlreadyBooked = memberBookedSlotIds.has(slot.id as string);
      return !trainerConflict && !memberAlreadyBooked;
    });

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error("GET /api/trainer/slots failed", error);
    return NextResponse.json({ error: "Failed to load slots" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trainerProfile = await prisma.trainer.findUnique({
    where: { userId: (session.user as any).id },
    select: { id: true },
  });

  if (!trainerProfile) {
    return NextResponse.json({ error: "Trainer profile missing" }, { status: 404 });
  }

  const body = await request.json();
  const startTime = new Date(body.startTime);
  const endTime = new Date(body.endTime);
  const isRecurring = Boolean(body.isRecurring);
  const weekday = isRecurring ? Number(body.weekday) : null;

  if (!startTime || !endTime || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return NextResponse.json({ error: "Invalid slot time" }, { status: 400 });
  }
  if (startTime >= endTime) {
    return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 });
  }
  if (isRecurring && (weekday === null || weekday < 0 || weekday > 6)) {
    return NextResponse.json({ error: "Weekday must be between 0 and 6" }, { status: 400 });
  }

  const overlap = await prisma.trainerAvailabilitySlot.findFirst({
    where: {
      trainerId: trainerProfile.id,
      isActive: true,
      ...(isRecurring
        ? {
            isRecurring: true,
            weekday,
          }
        : {
            isRecurring: false,
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          }),
      ...(isRecurring
        ? {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          }
        : {}),
    },
  });

  if (overlap) {
    return NextResponse.json({ error: "Slot overlaps with existing availability" }, { status: 409 });
  }

  const slot = await prisma.trainerAvailabilitySlot.create({
    data: {
      trainerId: trainerProfile.id,
      startTime,
      endTime,
      isRecurring,
      weekday,
      isActive: true,
    },
  });

  return NextResponse.json({ slot }, { status: 201 });
}
