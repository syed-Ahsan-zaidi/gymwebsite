"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteMemberAction(userId: string) {
  try {
    // User delete karne se Member profile khud delete ho jayegi (Cascade)
    await prisma.user.delete({
      where: { id: userId },
    });
    
    revalidatePath("/dashboard/members"); // List refresh karne ke liye
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, error: "Member delete nahi ho saka." };
  }
}
