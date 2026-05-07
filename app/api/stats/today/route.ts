import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma"; 

export const revalidate = 60;

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const stats = await prisma.payment.aggregate({
      where: {
        status:"SUCCESS",
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
    return NextResponse.json({ error: "Unable to load daily stats" }, { status: 500 });
  }
}
