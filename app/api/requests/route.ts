import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Ensure karein ke path sahi hai
export const dynamic = 'force-dynamic';
// 1. POST: Naya request create karne ke liye (Member Form)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming POST Data:", body); 

    if (!body.memberId || !body.type || !body.message) {
       return NextResponse.json({ 
         error: "Required fields missing!" 
       }, { status: 400 });
    }

    const result = await prisma.request.create({
      data: {
        memberId: body.memberId,
        type: body.type,
        message: body.message,
        status: "PENDING",
      }
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("POST_ERROR:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. PATCH: Request update karne ke liye (ApproveButton)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { requestId, newStatus } = body;
    
    console.log("Incoming PATCH Data:", body);

    if (!requestId) {
      return NextResponse.json({ error: "Request ID missing!" }, { status: 400 });
    }

    const updated = await prisma.request.update({
      where: { id: requestId },
      data: { 
        status: newStatus || "APPROVED" 
      }
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH_ERROR:", error.message);
    return NextResponse.json({ 
      error: "Update failed", 
      details: error.message 
    }, { status: 500 });
  }
}
