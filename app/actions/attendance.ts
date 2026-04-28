"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markAttendance(memberId: string) {
  try {
    const now = new Date();

    // 1. Member ka status aur expiry date fetch karen
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { 
        status: true, 
        expiresAt: true 
      }
    });

    if (!member) {
      return { success: false, message: "Member record not found!" };
    }

    // 🔴 CONDITION: Agar status ACTIVE nahi hai ya membership EXPIRE ho chuki hai
    const isExpired = member.expiresAt && now > member.expiresAt;
    
    if (member.status !== "ACTIVE" || isExpired) {
      return { 
        success: false, 
        message: "Attendance Denied! Aapki membership expire ho chuki hai. Please renew karein." 
      };
    }

    // 2. Check karen kya aaj ki attendance pehle hi lag chuki hai?
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: {
        memberId: memberId,
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    if (existing) {
      return { success: false, message: "Aap aaj ki attendance pehle hi laga chuke hain!" };
    }

    // 3. Sab theek hai, to attendance create karen
    await prisma.attendance.create({
      data: {
        memberId: memberId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Attendance Marked! Welcome to the gym." };

  } catch (error) {
    console.error("Attendance Error:", error);
    return { success: false, message: "System error! Please try again later." };
  }
}
