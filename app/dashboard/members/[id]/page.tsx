import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
// 1. TrainerPlanForm import karein
import TrainerPlanForm from "@/components/TrainerPlanForm";

export default async function MemberProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id: id },
    include: { 
      user: true, 
      trainer: true 
    }
  });

  if (!member) notFound();

  const now = new Date();
  const expiryDate = member.expiresAt;
  const daysLeft = expiryDate 
    ? Math.ceil((new Date(expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;
  
  const isExpired = member.status === "EXPIRED" || daysLeft <= 0;

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10 min-h-screen bg-gray-50/50">
      
      {/* Navigation Link */}
      <Link 
        href="/dashboard" 
        className="text-indigo-600 font-black flex items-center gap-2 hover:translate-x-[-5px] transition-all duration-200"
      >
        ← BACK TO DASHBOARD
      </Link>

      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b pb-8">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">
            Member<span className="text-indigo-600">Details</span>
          </h1>
          <p className="text-gray-500 font-bold mt-1 text-xl italic underline decoration-indigo-200">
            Viewing: {member.name}
          </p>
        </div>
        <div className={`px-6 py-2 rounded-full text-xs font-black tracking-[0.2em] ${isExpired ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
          {isExpired ? 'INACTIVE' : 'ACTIVE'} STATUS
        </div>
      </header>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`p-10 rounded-[3rem] border-2 shadow-sm transition-all ${isExpired ? "border-red-500 bg-red-50/50" : "border-green-500 bg-green-50/50"}`}>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2">Days Remaining</p>
          <h2 className={`text-6xl font-black ${isExpired ? "text-red-600" : "text-green-600"}`}>
            {isExpired ? "0" : daysLeft}
          </h2>
        </div>
        
        <div className="p-10 bg-indigo-600 rounded-[3rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden flex flex-col justify-center">
          <h3 className="font-black text-white/50 text-[10px] uppercase tracking-widest mb-2">Current Goal</h3>
          <p className="text-2xl font-black italic uppercase">{member.fitnessGoal}</p>
        </div>

        <div className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center">
           <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                 {member.trainer?.name?.charAt(0) || "C"}
              </div>
              <div>
                 <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Coach</p>
                 <p className="text-xl font-black text-gray-800 leading-tight">
                    {member.trainer?.name || "Unassigned"}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Detailed Info Section */}
      <div className="p-12 bg-white border border-gray-100 rounded-[4rem] shadow-sm">
        <h2 className="text-3xl font-black text-gray-900 mb-8 italic">Member Profile Info 📋</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="group">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Full Name</p>
              <p className="text-2xl font-bold text-gray-800 border-b-2 border-gray-50 group-hover:border-indigo-100 transition-colors pb-2">{member.name}</p>
            </div>
            <div className="group">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Email Address</p>
              <p className="text-xl font-bold text-gray-700">{member.user?.email || "N/A"}</p>
            </div>
            <div className="group">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Phone Number</p>
              <p className="text-xl font-bold text-gray-700">{member.phoneNumber || "Not Provided"}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="group">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Membership Since</p>
              <p className="text-xl font-bold text-gray-700">{member.joinedAt.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="group">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Expiry Date</p>
              <p className={`text-xl font-bold ${isExpired ? 'text-red-600' : 'text-gray-700'}`}>
                {member.expiresAt ? member.expiresAt.toLocaleDateString() : "No Date Set"}
              </p>
            </div>
            {member.phoneNumber && (
              <a href={`https://wa.me/${member.phoneNumber.replace(/\D/g, '')}`} className="inline-flex items-center justify-center gap-3 bg-green-500 text-white w-full py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-green-100 hover:bg-green-600 transition-all">
                CHAT ON WHATSAPP
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 2. Trainer Plan Section Add Karein */}
      <section className="pb-20">
        <h2 className="text-3xl font-black text-gray-900 mb-2 italic">Trainer Control Center 🛠️</h2>
        <p className="text-gray-500 font-bold mb-6">Assign workout routines or diet plans directly to this member.</p>
        
        {/* Yahan Form render ho raha hai */}
        <TrainerPlanForm 
          memberId={member.id} 
          trainerId={member.trainerId} 
        />
      </section>

    </div>
  );
}
