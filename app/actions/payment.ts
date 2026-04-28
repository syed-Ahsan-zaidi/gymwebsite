"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approvePaymentAction(paymentId: string, memberId: string) {
  try {
    // 1. Pehle member ki current expiry check karen
    const currentMember = await prisma.member.findUnique({
      where: { id: memberId },
      select: { expiresAt: true }
    });

    const now = new Date();
    let baseDate = now;

    // 2. Agar membership abhi khatam nahi hui, to purani date se aage 30 din add karen
    // Agar khatam ho chuki hai, to 'today' se 30 din add karen
    if (currentMember?.expiresAt && currentMember.expiresAt > now) {
      baseDate = currentMember.expiresAt;
    }

    const expiry = new Date(baseDate);
    expiry.setDate(expiry.getDate() + 30); 

    // 3. Transaction: Payment aur Member dono update karen
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: { status: "SUCCESS" }
      }),
      prisma.member.update({
        where: { id: memberId },
        data: { 
          status: "ACTIVE", 
          expiresAt: expiry 
        }
      })
    ]);

    // 4. Dashboard ko refresh karen taake naye days nazar aayen
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (e) {
    console.error("Approval Error:", e);
    return { success: false, message: "Database error occurred" };
  }
}
