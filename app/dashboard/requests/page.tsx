// 1. Fix: Path ko @/lib/prisma kar diya kyunki aapki file ka naam prisma.ts hai
import { prisma } from "@/lib/prisma"; 
import Link from "next/link";
import { Inbox, Clock, User, ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import { redirect } from "next/navigation";

export default async function RequestsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  // 2. Fix: 'db' ki jagah 'prisma' use karna hai kyunki aapne upar 'prisma' import kiya hai
  const trainer = await prisma.trainer.findUnique({
    where: { userId: session.user.id }
  });

  if (!trainer) {
    return (
      <div className="p-8 text-white">
        <p>Trainer profile not found. Please contact admin.</p>
      </div>
    );
  }

  // 3. Fix: Yahan bhi 'db.request' ko 'prisma.request' kar diya
  const requests = await prisma.request.findMany({
    where: { 
      status: "PENDING",
      member: {
        trainerId: trainer.id 
      }
    },
    include: { 
      member: true 
    },
    orderBy: { 
      createdAt: "desc" 
    }
  });

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/30">
            <Inbox className="text-blue-500" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
              Inbound <span className="text-blue-600">Requests</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">
              Manage workout and diet plan queries
            </p>
          </div>
        </div>
        
        <div className="bg-slate-900 px-4 py-2 rounded-full border border-slate-800 text-xs font-bold text-slate-400">
          TOTAL PENDING: <span className="text-blue-500">{requests.length}</span>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl">
          <Inbox className="text-slate-700 mb-4" size={48} />
          <p className="text-slate-500 font-bold uppercase tracking-widest">No pending requests found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className="relative group overflow-hidden bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all hover:bg-slate-900/80 hover:border-blue-500/50 shadow-2xl"
            >
              <div className="space-y-3 z-10">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.2em] ${
                    req.type === "WORKOUT" 
                      ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" 
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  }`}>
                    {req.type}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    <Clock size={12} />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                    <User size={20} className="text-blue-500" />
                    {req.member?.name || "Unknown Member"}
                  </h3>
                  <p className="text-slate-400 text-sm mt-2 font-medium bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 italic">
                    "{req.message}"
                  </p>
                </div>
              </div>

              <Link 
                href={`/dashboard/members/${req.memberId}?requestId=${req.id}`}
                className="w-full md:w-auto"
              >
                <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-600/20 group-hover:gap-4">
                  Take Action <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
