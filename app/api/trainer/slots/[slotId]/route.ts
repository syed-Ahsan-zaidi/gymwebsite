export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getTrainerIdFromSession() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TRAINER") return null;

  const trainer = await prisma.trainer.findUnique({
    where: { userId: (session.user as any).id },
    select: { id: true },
  });
  return trainer?.id ?? null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const trainerId = await getTrainerIdFromSession();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slotId } = await params;
  const body = await request.json();

  const existingSlot = await prisma.trainerAvailabilitySlot.findFirst({
    where: { id: slotId, trainerId },
  });
  if (!existingSlot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });

  const startTime = body.startTime ? new Date(body.startTime) : existingSlot.startTime;
  const endTime = body.endTime ? new Date(body.endTime) : existingSlot.endTime;
  const isRecurring = body.isRecurring ?? existingSlot.isRecurring;
  const weekday = isRecurring ? Number(body.weekday ?? existingSlot.weekday ?? startTime.getUTCDay()) : null;
  const isActive = body.isActive ?? existingSlot.isActive;

  if (startTime >= endTime) {
    return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 });
  }

  const overlap = await prisma.trainerAvailabilitySlot.findFirst({
    where: {
      id: { not: slotId },
      trainerId,
      isActive: true,
      ...(isRecurring
        ? { isRecurring: true, weekday, startTime: { lt: endTime }, endTime: { gt: startTime } }
        : { isRecurring: false, startTime: { lt: endTime }, endTime: { gt: startTime } }),
    },
  });

  if (overlap) {
    return NextResponse.json({ error: "Slot overlaps with existing availability" }, { status: 409 });
  }

  const slot = await prisma.trainerAvailabilitySlot.update({
    where: { id: slotId },
    data: {
      startTime,
      endTime,
      isRecurring,
      weekday,
      isActive,
    },
  });

  return NextResponse.json({ slot });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const trainerId = await getTrainerIdFromSession();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slotId } = await params;
  const slot = await prisma.trainerAvailabilitySlot.findFirst({
    where: { id: slotId, trainerId },
  });
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });

  await prisma.trainerAvailabilitySlot.update({
    where: { id: slotId },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
