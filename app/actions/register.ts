"use server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function registerUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const gymId = formData.get("gymId") as string; 
    const adminSecret = formData.get("adminSecret") as string;

    const serverSecret = process.env.GYM_ADMIN_SECRET;

    // --- Validation Logic ---
    if (role === "ADMIN" || role === "SYSTEM_ADMIN") {
      const finalSecret = serverSecret || "1234";

      if (!adminSecret || adminSecret !== finalSecret) {
        return { error: "Invalid Admin Secret Key! Aap register nahi kar sakte." };
      }
    }

    // Member ke liye gymId compulsory hona chahiye
    if (role === "MEMBER" && !gymId) {
      return { error: "Please select a gym branch." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // --- DB Entry ---
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        // TypeScript ko batana ke ye string nahi balkay Prisma ka 'Role' enum hai
        role: role as Role, 
        // Sirf tab add karein jab gymId exist karti ho
        gymId: gymId || null, 
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Action Error:", error);
    
    // Prisma unique constraint error handling (Email check)
    if (error.code === 'P2002') {
      return { error: "Yeh email pehle se registered hai." };
    }
    
    return { error: "Registration fail ho gayi. Dobara koshish karein." };
  }
}
