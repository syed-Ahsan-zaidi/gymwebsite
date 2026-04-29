export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const userId = (session.user as any).id;

    // 1. Prisma Transaction: Member Profile aur Payment record aik sath banay ga
    const profile = await prisma.member.create({
      data: {
        userId: userId,
        name: data.name,
        phoneNumber: data.phoneNumber,
        age: parseInt(data.age) || 0,
        weight: parseFloat(data.weight) || 0,
        height: parseFloat(data.height) || 0,
        fitnessGoal: data.fitnessGoal || "",
        medicalHistory: data.medicalHistory || "",
        status: "PENDING",

        // ✨ FIX: Sirf wahi fields jo aapke schema mein maujood hain
        payments: {
          create: {
            amount: 3000, 
            status: "PENDING",
            // Agar aapke schema mein 'paymentMethod' field hai toh ye chalay ga
            paymentMethod: "STRIPE", 
          }
        }
      },
      include: {
        payments: true
      }
    });

    console.log(`✅ Success: Member ${profile.id} created for user ${userId}`);

    // 2. Frontend ko 'id' lazmi bhejni hai taake Stripe ka logic chale
    return NextResponse.json({ 
      success: true,
      message: "Profile created! Redirecting to payment...", 
      id: profile.id, 
      profile 
    });

  } catch (error: any) {
    console.error("❌ Setup API Error:", error.message);

    // Agar 'paymentMethod' ki wajah se ab bhi error aaye, toh niche wala catch use karein
    return NextResponse.json(
      { error: "Database error: Could not create profile. Check if schema matches fields." }, 
      { status: 500 }
    );
  }
}
