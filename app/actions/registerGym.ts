"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function registerGymAction(formData: FormData) {
  const gymNameInput = formData.get("gymName") as string;
  const locationInput = formData.get("location") as string; 
  const adminEmail = (formData.get("adminEmail") as string)?.toLowerCase().trim();
  const adminPassword = formData.get("adminPassword") as string;

  if (!gymNameInput || !locationInput || !adminEmail || !adminPassword) {
    return { error: "Saari fields bharna lazmi hain." };
  }

  try {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.$transaction(async (tx) => {
      // 1. Gym Create
      // Humne 'address' hata diya kyunke schema mein sirf 'location' hai
      const gym = await tx.gymProfile.create({
        data: {
          gymName: gymNameInput,
          location: locationInput, // ✅ Sirf ye field valid hai aapke schema ke mutabiq
        },
      });

      // 2. Admin User Create
      await tx.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
          gymId: gym.id,
        },
      });
    });

    // Dashboard refresh karein
    revalidatePath("/dashboard");
    return { success: true };

  } catch (error: any) {
    console.error("Registration Error:", error);
    return { error: "Registration failed: " + error.message };
  }
}
