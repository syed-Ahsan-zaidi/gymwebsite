export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database URL missing" }, { status: 500 });
  }

  try {
    const session = await getServerSession(authOptions);
    
    // Safety check for session and role
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId, memberId } = await req.json();

    if (!paymentId || !memberId) {
      return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Payment
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "SUCCESS" },
      });

      // 2. Get Member for expiry logic
      const member = await tx.member.findUnique({ where: { id: memberId } });
      
      const baseDate = (member?.status === "ACTIVE" && member.expiresAt && new Date(member.expiresAt) > new Date()) 
        ? new Date(member.expiresAt) 
        : new Date();

      const newExpiry = new Date(baseDate);
      newExpiry.setDate(baseDate.getDate() + 30);

      // 3. Update Member
      return await tx.member.update({
        where: { id: memberId },
        data: { status: "ACTIVE", expiresAt: newExpiry },
      });
    });

    return NextResponse.json({ message: "Success!", updatedMember: result });
  } catch (error: any) {
    console.error("Build/Runtime Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
