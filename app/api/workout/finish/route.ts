import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, exercises, progress } = body;

    if (!memberId) {
      return new NextResponse("Member ID is required", { status: 400 });
    }

    const session = await db.workoutSession.create({
      data: {
        memberId,
        exercises, // JSON array
        progress,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("[WORKOUT_FINISH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
