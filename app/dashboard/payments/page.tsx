import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import { redirect } from "next/navigation";
import AdminPaymentList from "@/components/AdminPaymentList";
import { CreditCard, History, Clock, Globe } from "lucide-react";
import SearchInput from "./SearchInput"; 

// Next.js 15+ mein searchParams ab ek Promise hai
export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await getServerSession(authOptions);

  // 1. Security Check
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  // Yahan 'await' lagana zaroori hai error khatam karne ke liye
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || "";
  
  const role = session.user.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  // 2. Dynamic Query logic
  const whereClause = isSuperAdmin 
    ? { status: "PENDING" } 
    : { status: "PENDING", member: { user: { gymId: (session.user as any).gymId } } };

  const historyWhereClause: any = {
    status: "SUCCESS",
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
      : { member: { user: { gymId: (session.user as any).gymId } } }
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

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 italic uppercase">
          {isSuperAdmin ? <Globe className="text-indigo-600" size={32} /> : <CreditCard className="text-blue-600" size={32} />}
          {isSuperAdmin ? "Global Gym Payments" : "Branch Payment Management"}
        </h1>
        <p className="text-gray-500 font-medium italic">
          {isSuperAdmin ? "Monitoring and verifying receipts across all registered branches." : "Verify member receipts and manage subscription renewals."}
        </p>
      </header>

      {/* SEARCH BAR (Only for Super Admin) */}
      {isSuperAdmin && <SearchInput />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Pending Payments */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tight">
            <Clock className="text-orange-500" size={20} />
            Pending Verification ({pendingPayments.length})
          </h2>
          <AdminPaymentList payments={pendingPayments} />
        </div>

        {/* Right Column: Payment History */}
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
