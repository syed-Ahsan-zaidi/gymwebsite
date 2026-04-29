import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma"; 

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Pakistan Timezone ke mutabiq aaj ki date start
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 2. Database query
    // AGAR ERROR AAYE TO "memberPayment" KO BADAL KAR "payment" KAR KE DEKHEIN
    const stats = await prisma.payment.aggregate({
      where: {
        status:"SUCCESS", // Screenshot mein status capital "APPROVED" hi lag raha hai
        createdAt: { 
          gte: startOfToday 
        },
      },
      _sum: { 
        amount: true 
      },
      _count: { 
        id: true 
      },
    });

    return NextResponse.json({
      totalAmount: stats._sum.amount || 0,
      totalCount: stats._count.id || 0,
    });
  } catch (error: any) {
    console.error("API Stats Error:", error);
    
    // Developer insight ke liye error message return karein
    return NextResponse.json(
      { 
        error: error.message,
        hint: "Check if your model name is 'memberPayment' or 'payment' in schema.prisma" 
      }, 
      { status: 500 }
    );
  }
}
