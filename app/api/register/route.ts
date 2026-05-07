export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import  prisma  from "@/lib/prisma";
import { hasAdminApprovalStatusColumn } from "@/lib/dbCapabilities";

export async function POST(req: Request) {
  try {
    const { email, password, role, gymId } = await req.json();
    const normalizedRole = String(role || "MEMBER").toUpperCase();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const canUseAdminApproval = await hasAdminApprovalStatusColumn();

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: normalizedRole as any,
        gymId: gymId || null,
        ...(canUseAdminApproval
          ? {
              adminApprovalStatus:
                normalizedRole === "ADMIN" ? "PENDING" : "APPROVED",
            }
          : {}),
      },
    });

    return NextResponse.json(
      {
        message:
          normalizedRole === "ADMIN"
            ? "Admin request submitted. Wait for super admin approval."
            : "User created successfully!",
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "User registration failed or user already exists." }, 
      { status: 500 }
    );
  }
}
