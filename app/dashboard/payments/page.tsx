import prisma from "@/lib/prisma"; 
import { PaymentStatus, Prisma } from "@prisma/client"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminPaymentList from "@/components/AdminPaymentList";
import { CreditCard, History, Clock, Globe } from "lucide-react";
import SearchInput from "./SearchInput";
import RecentApprovalsTable from "@/components/RecentApprovalsTable" 

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || "";
  const currentPage = Math.max(Number.parseInt(resolvedSearchParams?.page || "1", 10) || 1, 1);
  const pageSize = 10;
  
  const role = session.user.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const userGymId = (session.user as any).gymId;

  const whereClause: Prisma.PaymentWhereInput = {
    status: PaymentStatus.PENDING,
    ...(isSuperAdmin 
      ? {} 
      : { member: { user: { gymId: userGymId } } }
    ),
  };

  const historyWhereClause: Prisma.PaymentWhereInput = {
    status: PaymentStatus.SUCCESS,
    ...(isSuperAdmin 
      ? { 
          member: { 
            user: { 
              gym: { 
                gymName: { contains: search, mode: "insensitive" } 
              } 
            } 
          } 
        }
      : { member: { user: { gymId: userGymId } } }
    )
  };

  const pendingPayments = await prisma.payment.findMany({
    where: whereClause,
    select: {
      id: true,
      amount: true,
      receiptUrl: true,
      memberId: true,
      member: {
        select: {
          name: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  const totalApprovals = await prisma.payment.count({
    where: historyWhereClause,
  });

  const totalPages = Math.max(1, Math.ceil(totalApprovals / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const skip = (safePage - 1) * pageSize;

  const paymentHistory = await prisma.payment.findMany({
    where: historyWhereClause,
    include: { 
      member: { 
        include: { user: { include: { gym: true } } } 
      } 
    },
    skip,
    take: pageSize,
    orderBy: { updatedAt: "desc" },
  });

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/dashboard/payments?${query}` : "/dashboard/payments";
  };

  const visibleStart = totalApprovals === 0 ? 0 : skip + 1;
  const visibleEnd = Math.min(skip + pageSize, totalApprovals);

  const getVisiblePages = () => {
    const pages = new Set<number>([1, totalPages, safePage - 1, safePage, safePage + 1]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 md:px-10">
        <header className="space-y-2">
            <h1 className="flex items-center gap-3 text-2xl font-black uppercase italic text-gray-900 sm:text-3xl">
            {isSuperAdmin ? <Globe className="text-indigo-600" size={32} /> : <CreditCard className="text-blue-600" size={32} />}
            {isSuperAdmin ? "Global Gym Payments" : "Branch Payment Management"}
            </h1>
            <p className="text-gray-500 font-medium italic">
            {isSuperAdmin ? "Monitoring and verifying receipts across all registered branches." : "Verify member receipts and manage subscription renewals."}
            </p>
        </header>

        {isSuperAdmin && <SearchInput />}

        <div className="space-y-8">
            <div className="space-y-6">
                <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight text-gray-800 sm:text-xl">
                    <Clock className="text-orange-500" size={20} />
                    Pending Verification ({pendingPayments.length})
                </h2>
                <AdminPaymentList payments={pendingPayments} />
            </div>

            <div className="space-y-6">
                <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight text-gray-800 sm:text-xl">
                    <History className="text-gray-400" size={20} />
                    Recent Approvals
                </h2>
                
                {paymentHistory.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                        <p className="text-sm text-gray-400 text-center py-4 italic">No matching records found.</p>
                    </div>
                ) : (
                    <>
                        <RecentApprovalsTable approvals={paymentHistory} />

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
                            <p className="text-gray-500">
                                Showing {visibleStart}-{visibleEnd} of {totalApprovals} approvals (Page {safePage}/{totalPages})
                            </p>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                    href={buildPageHref(safePage - 1)}
                                    aria-disabled={safePage <= 1}
                                    className={`px-3 py-1.5 rounded-md border text-sm transition ${
                                      safePage <= 1
                                        ? "pointer-events-none opacity-50 border-gray-200 text-gray-400"
                                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    Previous
                                </Link>
                                {visiblePages.map((page) => (
                                    <Link
                                        key={page}
                                        href={buildPageHref(page)}
                                        className={`px-3 py-1.5 rounded-md border text-sm transition ${
                                          page === safePage
                                            ? "border-blue-600 bg-blue-600 text-white"
                                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                                <Link
                                    href={buildPageHref(safePage + 1)}
                                    aria-disabled={safePage >= totalPages}
                                    className={`px-3 py-1.5 rounded-md border text-sm transition ${
                                      safePage >= totalPages
                                        ? "pointer-events-none opacity-50 border-gray-200 text-gray-400"
                                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    Next
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    </div>
  );
}
