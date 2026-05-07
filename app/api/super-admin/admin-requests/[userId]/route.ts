export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasAdminApprovalStatusColumn } from "@/lib/dbCapabilities";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const canUseAdminApproval = await hasAdminApprovalStatusColumn();
  if (!canUseAdminApproval) {
    return NextResponse.json(
      { error: "Admin approval workflow is not available on this database." },
      { status: 409 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const body = await request.json();
  const decision = String(body?.decision || "").toUpperCase();

  if (!userId || (decision !== "APPROVE" && decision !== "REJECT")) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const pendingAdmin = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, adminApprovalStatus: true },
  });

  if (!pendingAdmin || pendingAdmin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin request not found" }, { status: 404 });
  }

  if (pendingAdmin.adminApprovalStatus !== "PENDING") {
    return NextResponse.json({ error: "Request already processed" }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      adminApprovalStatus: decision === "APPROVE" ? "APPROVED" : "REJECTED",
    },
    select: {
      id: true,
      email: true,
      adminApprovalStatus: true,
    },
  });

  return NextResponse.json({ request: updated }, { status: 200 });
}
