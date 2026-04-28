export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  // 1. Build-time Safety: Agar DB URL nahi hai (jo build worker mein aksar nahi hoti), toh foran exit karein
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database configuration is missing during build/runtime." }, { status: 500 });
  }

  try {
    // 2. Security: Check karein ke Admin hi approve kar raha hai
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const { paymentId, memberId } = await req.json();

    if (!paymentId || !memberId) {
      return NextResponse.json({ error: "Missing paymentId or memberId" }, { status: 400 });
    }

    // 3. Transaction: Taake ya toh sab update ho ya kuch bhi nahi (Data Integrity)
    const result = await prisma.$transaction(async (tx) => {
      // A. Payment ko SUCCESS mark karein
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "SUCCESS" },
      });

      // B. Member ki current expiry check karein
      const member = await tx.member.findUnique({ where: { id: memberId } });
      
      // Agar member already active hai aur date valid hai, toh purani expiry mein 30 din add karein
      // Warna aaj ki date se 30 din agay ki date set karein
      const baseDate = (member?.status === "ACTIVE" && member.expiresAt && new Date(member.expiresAt) > new Date()) 
        ? new Date(member.expiresAt) 
        : new Date();

      const newExpiry = new Date(baseDate);
      newExpiry.setDate(baseDate.getDate() + 30);

      // C. Member ko ACTIVE karein aur nayi date save karein
      return await tx.member.update({
        where: { id: memberId },
        data: {
          status: "ACTIVE",
          expiresAt: newExpiry,
        },
      });
    });

    return NextResponse.json({ 
      message: "Payment approved and membership extended!", 
      updatedMember: result 
    });

  } catch (error: any) {
    console.error("Payment Approval Error:", error);
    return NextResponse.json({ 
      error: "Approval failed", 
      details: error.message 
    }, { status: 500 });
  }
}
