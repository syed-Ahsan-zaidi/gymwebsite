"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createWorkoutPlan(memberId: string, trainerId: string, content: any) {
  try {
    // Agar trainerId nahi hai, to error return karein
    if (!trainerId) {
      return { success: false, error: "Trainer assign hona zaroori hai." };
    }

    await prisma.plan.create({
      data: {
        memberId: memberId,
        trainerId: trainerId,
        type: "WORKOUT", 
        content: content, // Ye JSON format mein save hoga
        isApproved: true,
      }
    });

    // Page ko refresh karne ke liye taake naya data nazar aaye
    revalidatePath(`/dashboard/members/${memberId}`);
    return { success: true };
  } catch (error) {
    console.error("Plan Creation Error:", error);
    return { success: false, error: "Database error: Plan save nahi ho saka." };
  }
}
