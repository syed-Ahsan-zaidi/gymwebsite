export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(searchParams.get("pageSize") || "10", 10) || 10, 1), 25);
    const skip = (page - 1) * pageSize;
    const gymId = (session.user as any).gymId as string | undefined;
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    const where = {
      member: {
        user: {
          ...(isSuperAdmin ? {} : { gymId }),
          gym: {
            gymName: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
      },
    };

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          amount: true,
          transactionId: true,
          paymentMethod: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          member: {
            select: {
              id: true,
              name: true,
              user: { select: { id: true, gym: { select: { gymName: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);
    return NextResponse.json({
      payments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Data fetch failed" }, { status: 500 });
  }
}
