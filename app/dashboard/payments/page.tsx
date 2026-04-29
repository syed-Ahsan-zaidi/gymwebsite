import  prisma  from "@/lib/prisma"; // Import prisma normally
import { PaymentStatus, Prisma } from "@prisma/client"; // Prisma types import karein
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import AdminPaymentList from "@/components/AdminPaymentList";
import { CreditCard, History, Clock, Globe } from "lucide-react";
import SearchInput from "./SearchInput"; 

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || "";
  
  const role = session.user.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const userGymId = (session.user as any).gymId;

  // --- 1. FIXED WHERE CLAUSE WITH EXPLICIT TYPE ---
  const whereClause: Prisma.PaymentWhereInput = {
    status: PaymentStatus.PENDING, // Use Enum instead of string
    ...(isSuperAdmin 
      ? {} 
      : { member: { user: { gymId: userGymId } } }
    ),
  };

  // --- 2. FIXED HISTORY WHERE CLAUSE ---
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

  // Data Fetching
  const pendingPayments = await prisma.payment.findMany({
    where: whereClause,
    include: { 
      member: { 
        include: { user: { include: { gym: true } } } 
      } 
    },
    orderBy: { createdAt: "desc" },
  });

  const paymentHistory = await prisma.payment.findMany({
    where: historyWhereClause,
    include: { 
      member: { 
        include: { user: { include: { gym: true } } } 
      } 
    },
    take: search ? undefined : 10,
    orderBy: { updatedAt: "desc" },
  });

  // ... (Baqi UI code wesa hi rahega)
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
        {/* Aapka UI content yahan aye ga */}
        <header className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 italic uppercase">
            {isSuperAdmin ? <Globe className="text-indigo-600" size={32} /> : <CreditCard className="text-blue-600" size={32} />}
            {isSuperAdmin ? "Global Gym Payments" : "Branch Payment Management"}
            </h1>
            <p className="text-gray-500 font-medium italic">
            {isSuperAdmin ? "Monitoring and verifying receipts across all registered branches." : "Verify member receipts and manage subscription renewals."}
            </p>
        </header>

        {isSuperAdmin && <SearchInput />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tight">
                    <Clock className="text-orange-500" size={20} />
                    Pending Verification ({pendingPayments.length})
                </h2>
                <AdminPaymentList payments={pendingPayments} />
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tight">
                    <History className="text-gray-400" size={20} />
                    Recent Approvals
                </h2>
                <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                    {paymentHistory.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4 italic">No matching records found.</p>
                    ) : (
                        paymentHistory.map((log) => (
                            <div key={log.id} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="text-sm font-black text-gray-900">{log.member.name}</p>
                                    {isSuperAdmin && (
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase">
                                            {log.member?.user?.gym?.gymName || "Main Branch"}
                                        </p>
                                    )}
                                    <p className="text-[10px] text-gray-400 font-medium italic">
                                        {new Date(log.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-green-600 italic">PKR {log.amount}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
