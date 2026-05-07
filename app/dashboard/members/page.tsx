import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AssignTrainerDropdown from "@/components/AssignTrainerDropdown";
import DeleteMemberBtn from "@/components/DeleteMemberBtn";
import { redirect } from "next/navigation";
import Link from "next/link";

type MembersPageProps = {
  searchParams?: {
    page?: string;
  };
};

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const myGymId = (session?.user as any)?.gymId;
  const perPage = 10;
  const currentPage = Math.max(Number(searchParams?.page ?? "1") || 1, 1);
  const skip = (currentPage - 1) * perPage;

  const [totalMembers, members, trainers] = await Promise.all([
    prisma.member.count({
      where: { user: { gymId: myGymId } },
    }),
    prisma.member.findMany({
      where: { user: { gymId: myGymId } },
      include: { user: { select: { id: true } } },
      orderBy: { joinedAt: "desc" },
      skip,
      take: perPage,
    }),
    prisma.trainer.findMany({
      where: { user: { gymId: myGymId } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalMembers / perPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startItem = totalMembers === 0 ? 0 : (safeCurrentPage - 1) * perPage + 1;
  const endItem = Math.min(safeCurrentPage * perPage, totalMembers);

  const paginationWindow = 5;
  const windowStart = Math.max(1, safeCurrentPage - Math.floor(paginationWindow / 2));
  const windowEnd = Math.min(totalPages, windowStart + paginationWindow - 1);
  const pageNumbers = Array.from({ length: windowEnd - windowStart + 1 }, (_, index) => windowStart + index);

  return (
    <div className="px-4 py-6 sm:px-6 md:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold uppercase italic text-black">
          Branch <span className="text-indigo-600">Members</span>
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Showing {startItem}-{endItem} of {totalMembers}
        </p>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y md:hidden">
          {members.length === 0 ? (
            <p className="p-8 text-center text-sm font-bold italic text-slate-400">No members found in this branch.</p>
          ) : (
            members.map((m) => {
              const isExpired = m.expiresAt ? new Date(m.expiresAt) < new Date() : true;
              return (
                <div key={m.id} className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold uppercase italic tracking-tight text-slate-800">{m.name}</p>
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase ${
                        isExpired
                          ? "border-red-100 bg-red-50 text-red-600"
                          : "border-emerald-100 bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {isExpired ? "Expired" : "Active"}
                    </span>
                  </div>
                  <AssignTrainerDropdown memberId={m.id} trainers={trainers} currentTrainerId={m.trainerId} />
                  <DeleteMemberBtn userId={m.userId} />
                </div>
              );
            })
          )}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[680px] text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="p-4">Member Name</th>
              <th className="p-4">Assign Trainer</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th> 
            </tr>
          </thead>
          <tbody className="text-black divide-y divide-slate-50">
            {members.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-slate-400 font-bold italic">
                  No members found in this branch.
                </td>
              </tr>
            ) : (
              members.map((m) => {
                // ✅ Step 1: Har member ke liye expiry check karein
                const isExpired = m.expiresAt ? new Date(m.expiresAt) < new Date() : true;

                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800 uppercase italic tracking-tight">
                      {m.name}
                    </td>
                    <td className="p-4">
                      <AssignTrainerDropdown 
                        memberId={m.id} 
                        trainers={trainers} 
                        currentTrainerId={m.trainerId} 
                      />
                    </td>
                    <td className="p-4">
                      {/* ✅ Step 2: Dynamic Status Light aur Text */}
                      <div className="flex items-center gap-2">
                        {/* Choti blinking light agar expired ho */}
                        <div className={`w-2 h-2 rounded-full ${isExpired ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
                        
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${
                          isExpired 
                            ? 'bg-red-50 text-red-600 border border-red-100 shadow-[0_0_8px_rgba(239,68,68,0.1)]' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                        }`}>
                          {isExpired ? "Expired" : "Active"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <DeleteMemberBtn userId={m.userId} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Page {safeCurrentPage} of {totalPages}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/members?page=${Math.max(1, safeCurrentPage - 1)}`}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase transition ${
                safeCurrentPage === 1
                  ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Prev
            </Link>
            {pageNumbers.map((pageNumber) => (
              <Link
                key={pageNumber}
                href={`/dashboard/members?page=${pageNumber}`}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  safeCurrentPage === pageNumber
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {pageNumber}
              </Link>
            ))}
            <Link
              href={`/dashboard/members?page=${Math.min(totalPages, safeCurrentPage + 1)}`}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase transition ${
                safeCurrentPage === totalPages
                  ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}