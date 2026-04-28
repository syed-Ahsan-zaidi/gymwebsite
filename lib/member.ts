"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Member ka Fitness Goal update karne ke liye Server Action
 */
export async function updateMemberGoalAction(memberId: string, newGoal: string) {
  try {
    // 1. Database mein specific member ka goal update karein
    await prisma.member.update({
      where: { 
        id: memberId 
      },
      data: { 
        fitnessGoal: newGoal 
      }
    });

    // 2. Dashboard page ko revalidate karein taake UI foran update ho jaye
    revalidatePath("/dashboard");

    return { 
      success: true, 
      message: "Goal updated successfully!" 
    };
  } catch (error) {
    console.error("Goal update error:", error);
    return { 
      success: false, 
      error: "Database update failed. Please try again." 
    };
  }
}

/**
 * Naya member create karne ke liye Action (Jo aapne pehle likha tha)
 */
export async function createMemberAction(formData: any, userId: string) {
  try {
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
    return { success: false, error: "Member and Payment record not created." };
  }
}
