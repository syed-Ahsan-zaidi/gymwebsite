export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = (await request.json()) as { status: BookingStatus };

  if (!status || !Object.values(BookingStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const booking = await prisma.sessionBooking.findUnique({
    where: { id },
    include: {
      trainer: { select: { userId: true } },
      member: { select: { userId: true } },
    },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const userId = (session.user as any).id as string;
  const role = session.user.role;

  const trainerOwned = role === "TRAINER" && booking.trainer.userId === userId;
  const memberOwned = role === "MEMBER" && booking.member.userId === userId;

  if (!trainerOwned && !memberOwned) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (memberOwned && status !== BookingStatus.CANCELLED) {
    return NextResponse.json({ error: "Member can only cancel own booking" }, { status: 403 });
  }

  const updated = await prisma.sessionBooking.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ booking: updated });
}
