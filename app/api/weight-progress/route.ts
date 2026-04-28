import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Aapka prisma instance

export async function GET() {
  try {
    const weights = await prisma.weightLog.findMany({
      orderBy: { date: 'asc' },
      take: 10, // Sirf last 10 entries
    });

    // Recharts ko date string format mein chahiye hoti hai
    const formattedData = weights.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      weight: item.weight,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    return NextResponse.json({ error: "Data fetch nahi ho saka" }, { status: 500 });
  }
}
