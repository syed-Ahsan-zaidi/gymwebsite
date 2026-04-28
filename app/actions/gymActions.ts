"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const updateGymByAdmin = async (gymId: string, formData: FormData) => {
  try {
    const gymName = formData.get("gymName") as string;
    const location = formData.get("location") as string;

    await prisma.gymProfile.update({
      where: { id: gymId },
      data: {
        gymName,
        location,
      },
    });

    // Is se dashboard ka data foran update ho jaye ga
    revalidatePath("/dashboard"); 
    return { success: true };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, message: "Update fail ho gaya" };
  }
};
