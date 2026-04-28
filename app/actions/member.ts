"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. ✨ Update Goal Action (Ye missing tha)
export async function updateMemberGoalAction(memberId: string, newGoal: string) {
  try {
    await prisma.member.update({
      where: { id: memberId },
      data: { fitnessGoal: newGoal }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Goal update error:", error);
    return { success: false, error: "Failed to update goal." };
  }
}

// 2. Member Create Action (Aapka purana code)
export async function createMemberAction(formData: any, userId: string) {
  try {
    // Member create karein aur saath hi Payment entry bhi (Atomic transaction)
    const newMember = await prisma.member.create({
      data: {
        userId: userId,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        age: parseInt(formData.age) || 0,
        weight: parseFloat(formData.weight) || 0,
        height: parseFloat(formData.height) || 0,
        fitnessGoal: formData.fitnessGoal,
        status: "PENDING",

        // ✨ AUTO-LOGIC: Member ke saath Payment record bhi ban jaye
        payments: {
          create: {
            amount: 3000, 
            status: "PENDING",
          }
        }
      }
    });

    revalidatePath("/dashboard");
    return { success: true, member: newMember };
  } catch (error) {
    console.error("Member creation error:", error);
    return { success: false, error: "Database error: Member and Payment record not created." };
  }
}
