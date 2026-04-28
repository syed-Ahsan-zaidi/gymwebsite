export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ---------------------------------------------------------
// 1. POST METHOD: Member ki taraf se payment submit karna
// ---------------------------------------------------------
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Pehle login karein" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, transactionId, method } = body;

    const member = await prisma.member.findUnique({
      where: { userId: session.user.id },
    });

    if (!member) {
      return NextResponse.json({ error: "Member profile nahi mili" }, { status: 404 });
    }

    const newPayment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        transactionId: transactionId,
        paymentMethod: method,
        status: "PENDING", 
        memberId: member.id,
      },
    });

    return NextResponse.json(newPayment);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Transaction ID pehle se mojud hai ya technical masla hai" }, 
      { status: 400 }
    );
  }
}

// ---------------------------------------------------------
// 2. GET METHOD: Admin ke liye payments fetch aur search karna
// ---------------------------------------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const payments = await prisma.payment.findMany({
      where: {
        member: {
          user: {
            gym: {
              gymName: {
                contains: search,
                mode: 'insensitive' // Isse ABC ya abc ka farq nahi parega
              }
            }
          }
        }
      },
      include: {
        member: {
          include: {
            user: {
              include: { gym: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }, // Sabse nayi payments upar
      take: search ? undefined : 10   // Khali search par sirf 10, warna saari
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Data fetch failed" }, { status: 500 });
  }
}
