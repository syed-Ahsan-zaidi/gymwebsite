import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // 1. Session Check
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, experience, specialization } = body;

    // 2. Data Validation
    if (!name || !experience || !specialization) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const experienceInt = parseInt(experience);
    if (isNaN(experienceInt)) {
      return NextResponse.json({ error: "Experience must be a number" }, { status: 400 });
    }

    // 3. Upsert Logic (Create or Update)
    // Iska faida ye hai ke agar profile pehle se hai to update ho jayegi, warna create.
    const trainerProfile = await prisma.trainer.upsert({
      where: {
        userId: session.user.id, // Schema mein @unique hona chahiye (jo aapke mein hai)
      },
      update: {
        name,
        experience: experienceInt,
        specialization,
      },
      create: {
        userId: session.user.id,
        name,
        experience: experienceInt,
        specialization,
      },
    });

    // 4. Role Update (Optional but Recommended)
    // User ka role bhi "TRAINER" kar dein agar wo trainer profile bana raha hai
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "TRAINER" },
    });

    return NextResponse.json(trainerProfile);
  } catch (error: any) {
    console.error("Trainer Setup Error:", error);
    
    // Prisma specific error handling
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Trainer profile already exists for this user" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
