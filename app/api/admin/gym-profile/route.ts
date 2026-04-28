export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Security Check (Ensure user is ADMIN in database)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { gymName, location, facilities } = body;

    // String "1" use kar rahe hain kyunke Neon/Prisma mein aksar ID string hoti hai
    const profile = await prisma.gymProfile.upsert({
      where: { id: "1" },
      update: { 
        gymName: gymName || "FlexManage Pro", 
        location: location || "Main Branch", 
        facilities 
      },
      create: { 
        id: "1", 
        gymName: gymName || "FlexManage Pro", 
        location: location || "Main Branch", 
        facilities, 
        adminSecret: "flex-secret" 
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("DETAILED_PRISMA_ERROR:", error); // Terminal mein error check karein
    return NextResponse.json({ 
      error: "Database update failed", 
      details: error.message 
    }, { status: 500 });
  }
}
