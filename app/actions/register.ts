"use server";
import bcrypt from "bcryptjs";
import prisma  from "@/lib/prisma";
import { AdminApprovalStatus, Role } from "@prisma/client";
import { hasAdminApprovalStatusColumn } from "@/lib/dbCapabilities";

export async function registerUser(formData: FormData) {
  try {
    const email = (formData.get("email") as string).trim().toLowerCase();
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const normalizedRole = role?.toUpperCase() as Role;
    const gymId = formData.get("gymId") as string; 
    const canUseAdminApproval = await hasAdminApprovalStatusColumn();
    // Secret key intentionally not required for any role.

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
        role: normalizedRole,
        ...(canUseAdminApproval
          ? {
              adminApprovalStatus:
                normalizedRole === "ADMIN"
                  ? AdminApprovalStatus.PENDING
                  : AdminApprovalStatus.APPROVED,
            }
          : {}),
        // Sirf tab add karein jab gymId exist karti ho
        gymId: gymId || null, 
      },
    });

    if (normalizedRole === "ADMIN") {
      return { success: true, message: "Admin request submitted. Wait for super admin approval." };
    }

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
