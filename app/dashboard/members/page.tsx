import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AssignTrainerDropdown from "@/components/AssignTrainerDropdown";
import DeleteMemberBtn from "@/components/DeleteMemberBtn";
import { redirect } from "next/navigation";

export default async function MembersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const myGymId = (session?.user as any)?.gymId;

  const [members, trainers] = await Promise.all([
    prisma.member.findMany({
      where: { user: { gymId: myGymId } },
      include: { user: { select: { id: true } } },
      orderBy: { joinedAt: 'desc' }
    }),
    prisma.trainer.findMany({
      where: { user: { gymId: myGymId } } 
    })
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-black uppercase italic">
        Branch <span className="text-indigo-600">Members</span>
      </h1>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
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
  );
}