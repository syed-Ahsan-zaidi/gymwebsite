export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getTrainerUserId() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TRAINER") return null;
  return (session.user as any).id as string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getTrainerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const trainer = await prisma.trainer.findUnique({ where: { userId }, select: { id: true } });
  if (!trainer) return NextResponse.json({ error: "Trainer profile missing" }, { status: 404 });

  const existing = await prisma.groupClass.findFirst({ where: { id, trainerId: trainer.id } });
  if (!existing) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const body = await request.json();
  const startTime = body.startTime ? new Date(body.startTime) : existing.startTime;
  const endTime = body.endTime ? new Date(body.endTime) : existing.endTime;
  const capacity = body.capacity ? Number(body.capacity) : existing.capacity;
  const title = body.title ? String(body.title).trim() : existing.title;
  const classType = body.classType ? String(body.classType).trim() : existing.classType;
  const isActive = body.isActive ?? existing.isActive;

  if (startTime >= endTime || !Number.isFinite(capacity) || capacity < 1) {
    return NextResponse.json({ error: "Invalid class timings/capacity" }, { status: 400 });
  }

  const conflict = await prisma.groupClass.findFirst({
    where: {
      id: { not: id },
      trainerId: trainer.id,
      isActive: true,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });
  if (conflict) return NextResponse.json({ error: "Class overlaps another class" }, { status: 409 });

  const updated = await prisma.groupClass.update({
    where: { id },
    data: { title, classType, startTime, endTime, capacity, isActive },
  });

  return NextResponse.json({ class: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getTrainerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const trainer = await prisma.trainer.findUnique({ where: { userId }, select: { id: true } });
  if (!trainer) return NextResponse.json({ error: "Trainer profile missing" }, { status: 404 });

  const existing = await prisma.groupClass.findFirst({ where: { id, trainerId: trainer.id } });
  if (!existing) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  await prisma.groupClass.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
