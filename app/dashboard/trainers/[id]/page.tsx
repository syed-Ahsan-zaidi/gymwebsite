import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

// 1. Params ko Promise type dena lazmi hai Next.js 15+ mein
export default async function TrainerProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  
  // 2. Params ko use karne se pehle await karein
  const { id } = await params;

  // 3. Ab Prisma ko sahi ID milay gi
  const trainer = await prisma.trainer.findUnique({
    where: { id: id },
    include: { 
      members: {
        orderBy: { joinedAt: 'desc' }
      } 
    }
  });

  if (!trainer) return notFound();

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <Link href="/dashboard" className="text-indigo-600 font-bold hover:underline">
        ← Back to Dashboard
      </Link>
      
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-xl">
            {trainer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900">{trainer.name}</h1>
            <p className="text-indigo-600 font-bold text-lg">{trainer.specialization || "Professional Coach"}</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Clients</p>
          <p className="text-5xl font-black text-gray-900">{trainer.members.length}</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-gray-800">Assigned Members List</h2>
        <div className="grid gap-3">
          {trainer.members.map((member) => (
            <div key={member.id} className="p-5 bg-white border border-gray-100 rounded-2xl flex justify-between items-center shadow-sm">
              <p className="font-bold text-gray-800 text-lg">{member.name}</p>
              <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-tight">
                {member.fitnessGoal}
              </span>
            </div>
          ))}
          {trainer.members.length === 0 && (
            <p className="text-center p-10 text-gray-400 font-bold italic">No members assigned yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
