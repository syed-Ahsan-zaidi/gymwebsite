import prisma from "@/lib/prisma";

let adminApprovalStatusColumnCache: boolean | null = null;

export async function hasAdminApprovalStatusColumn(): Promise<boolean> {
  if (adminApprovalStatusColumnCache !== null) {
    return adminApprovalStatusColumnCache;
  }

  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ exists: number }>>(`
      SELECT 1 as exists
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'User'
        AND column_name = 'adminApprovalStatus'
      LIMIT 1
    `);

    adminApprovalStatusColumnCache = rows.length > 0;
  } catch {
    adminApprovalStatusColumnCache = false;
  }

  return adminApprovalStatusColumnCache;
}
