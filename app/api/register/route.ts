export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import  prisma  from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, role, adminSecret } = await req.json();

    // Debugging: Terminal mein check karne ke liye (Sirf development ke waqt)
    console.log("DEBUG INFO:", {
      receivedRole: role,
      receivedSecret: adminSecret,
      envSecret: process.env.ADMIN_SECRET_KEY ? "SET" : "NOT SET"
    });

    // Admin Security Check
    // Note: Role ko lowercase karke check kar rahe hain taake case ka masla na ho
    if (role.toUpperCase() === "GYM ADMIN" || role.toUpperCase() === "ADMIN") {
      if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json(
          { error: "Invalid Admin Secret Key! Aap register nahi kar sakte." }, 
          { status: 403 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role, // Yeh wahi role save karega jo frontend se aaya
      },
    });

    return NextResponse.json({ message: "User created successfully!" }, { status: 201 });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "User registration failed or user already exists." }, 
      { status: 500 }
    );
  }
}
