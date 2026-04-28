"use server";

import { db } from "@/lib/db";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

/**
 * Naya weight record save karne ke liye
 */
export async function logWeight(memberId: string, weight: number) {
  try {
    console.log("Saving weight for:", memberId, weight); 

    // 1. Member ki presence check karein (Foreign Key Error se bachne ke liye)
    const member = await db.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      console.error("Member not found:", memberId);
      return { success: false, error: "Member not found in database" };
    }

    // 2. Data create karein
    const res = await db.weightLog.create({
      data: {
        weight: Number(weight), 
        date: new Date(),
        memberId: memberId,
      },
    });

    console.log("Database Response:", res);

    // Dashboard refresh karein taake graph update ho jaye
    revalidatePath("/dashboard/progress");
    return { success: true };
  } catch (error) {
    console.error("Error logging weight:", error);
    return { success: false, error: "Something went wrong while saving" };
  }
}

/**
 * Weight graph ke liye data fetch karne ke liye
 */
export async function getWeightHistory(memberId: string) {
  try {
    const logs = await db.weightLog.findMany({
      where: { memberId },
      orderBy: { date: 'asc' },
      take: 10, 
    });

    return logs.map(log => ({
      date: format(new Date(log.date), "MMM dd"),
      weight: log.weight
    }));
  } catch (error) {
    console.error("Weight History Error:", error);
    return [];
  }
}

/**
 * Heatmap ke liye attendance fetch karne ke liye
 */
export async function getAttendanceStats(memberId: string) {
  try {
    const attendance = await db.attendance.findMany({
      where: { memberId },
      orderBy: { date: 'asc' },
    });

    return attendance.map(a => ({
      date: new Date(a.date).toISOString().split('T')[0],
      count: 1
    }));
  } catch (error) {
    console.error("Attendance Stats Error:", error);
    return [];
  }
}
