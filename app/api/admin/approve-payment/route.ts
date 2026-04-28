import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // 1. Security: Check karein ke Admin hi approve kar raha hai
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId, memberId } = await req.json();

    // 2. Transaction: Taake ya toh sab update ho ya kuch bhi nahi (Safety)
    const result = await prisma.$transaction(async (tx) => {
      // A. Payment ko Success mark karein
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "SUCCESS" },
      });

      // B. Member ki current expiry check karein
      const member = await tx.member.findUnique({ where: { id: memberId } });
      
      // Agar member already active hai toh purani expiry mein add karo, 
      // warna aaj ki date se 30 din agay ki date set karo.
      const baseDate = (member?.status === "ACTIVE" && member.expiresAt && member.expiresAt > new Date()) 
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

    return NextResponse.json({ message: "Member Activated!", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Approval failed" }, { status: 500 });
  }
}
