"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteTrainer(trainerId: string) {
  try {
    // 1. Trainer aur uski userId hasil karein
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      select: { userId: true }
    });

    if (!trainer) return { success: false, error: "Trainer nahi mila." };

    // 2. Trainer ke banaye huay saare Plans delete karein (zaroori step)
    await prisma.plan.deleteMany({
      where: { trainerId: trainerId }
    });

    // 3. Ab main User delete karein (Is se Trainer profile Cascade delete ho jayegi)
    await prisma.user.delete({
      where: { id: trainer.userId }
    });

    revalidatePath("/dashboard/trainers");
    return { success: true };
  } catch (error) {
    console.error("Delete Error Details:", error);
    return { 
      success: false, 
      error: "Database error: Plans ya dependency ki wajah se remove nahi ho saka." 
    };
  }
}
