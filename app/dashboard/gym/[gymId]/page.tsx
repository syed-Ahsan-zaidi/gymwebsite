import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

// Notice: params ka type ab Promise hai
export default async function GymDetailPage({ 
  params 
}: { 
  params: Promise<{ gymId: string }> 
}) {
  
  // 1. Params ko pehle await karein (Next.js 15 rule)
  const resolvedParams = await params;
  const gymId = resolvedParams.gymId;

  // 2. Ab Prisma query sahi chale gi kyunki gymId defined hai
  const gym = await prisma.gymProfile.findUnique({
    where: { id: gymId },
    include: {
      _count: { select: { users: true } },
      users: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!gym) return notFound();

  return (
    <div className="p-10 space-y-8 bg-slate-50 min-h-screen">
      <header className="border-b pb-6">
        <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
          Branch: <span className="text-indigo-600">{gym.gymName}</span>
        </h1>
        <p className="text-slate-500 font-medium italic underline decoration-indigo-200 decoration-4">
          {gym.location}
        </p>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-indigo-50">
          <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Total Users</p>
          <p className="text-5xl font-black text-slate-800">{gym._count.users}</p>
        </div>
      </div>

      {/* Activity Logs Table */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-800 italic uppercase">User Logs</h2>
        <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-8 py-5">User</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {gym.users.map((user) => (
                <tr key={user.id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-700">{user.email}</td>
                  <td className="px-8 py-5 text-xs font-black text-indigo-600 uppercase italic">{user.role}</td>
                  <td className="px-8 py-5 text-right text-xs text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
