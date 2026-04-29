import WeightTracker from "@/components/analytics/WeightTracker";
import AttendanceMap from "@/components/analytics/AttendanceMap";
import WeightInputForm from "@/components/analytics/WeightInputForm"; 
import { getWeightHistory, getAttendanceStats } from "@/app/actions/analytics";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma"; 
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const member = await prisma.member.findFirst({
    where: {
      user: {
        email: session.user.email
      }
    }
  });

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-2xl font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-slate-500 max-w-sm">
          Aapka member account database mein nahi mila. Please contact support or complete your profile.
        </p>
      </div>
    );
  }

  const memberId = member.id; 

  // ✅ FIXED: Explicitly defining types to avoid 'implicitly has any[] type' error
  let weightData: any[] = [];
  let attendanceData: any[] = [];

  try {
    const [weights, attendance] = await Promise.all([
      getWeightHistory(memberId),
      getAttendanceStats(memberId)
    ]);
    weightData = weights || [];
    attendanceData = attendance || [];
  } catch (error) {
    console.error("Error fetching analytics data:", error);
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">
            Personal <span className="text-blue-600">Progress</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Welcome back, <span className="text-slate-900 font-bold">{session.user.name}</span>!
          </p>
        </div>
        
        <div className="max-w-xs w-full">
          <WeightInputForm memberId={memberId} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Weight Journey</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col justify-center">
            {weightData.length > 0 ? (
               <WeightTracker data={weightData} />
            ) : (
               <p className="text-center text-slate-400">No weight logs found. Add your first log above!</p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Consistency Map</h2>
          </div>
          <div className="min-h-[250px]">
            <AttendanceMap data={attendanceData} />
          </div>
        </section>
      </div>
    </div>
  );
}
