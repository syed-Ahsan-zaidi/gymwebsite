import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasAdminApprovalStatusColumn } from "@/lib/dbCapabilities";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Components
import EditGymModal from "@/components/EditGymModal";
import MemberSetupForm from "@/components/MemberSetupForm";
import TrainerSetupForm from "@/components/TrainerSetupForm";
import GymProfileForm from "@/components/GymProfileForm";
import AdminPaymentList from "@/components/AdminPaymentList";
import GoalEditor from "@/components/GoalEditor";
import CheckInButton from "@/components/AttendanceButton"; 
import StripeButton from "@/components/StripeButton"; 
import DeleteGymBtn from "@/components/DeleteGymBtn"; 
import MemberRequestSection from "@/components/MemberRequestSection";
import ApproveButton from "@/components/ApproveButton";
import AdminRequestActions from "@/components/AdminRequestActions";

// Icons
import { CreditCard, Rocket, Activity, Settings } from "lucide-react";

export const revalidate = 60;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;
  
  if (!session || !session.user) redirect("/login");

  const userRole = session.user.role;
  const userId = (session.user as any).id;
  const userGymId = (session.user as any).gymId;

  // --- 1. SUPER ADMIN VIEW ---
  if (userRole === "SUPER_ADMIN") {
      const canUseAdminApproval = await hasAdminApprovalStatusColumn();
      const [totalGyms, totalUsers, gyms, pendingAdminRequests] = await Promise.all([
        prisma!.gymProfile.count(),
        prisma!.user.count(),
        prisma!.gymProfile.findMany({
          include: { _count: { select: { users: true } } },
          orderBy: { createdAt: "desc" },
        }),
        canUseAdminApproval
          ? prisma!.user.findMany({
              where: { role: "ADMIN", adminApprovalStatus: "PENDING" },
              select: {
                id: true,
                email: true,
                createdAt: true,
                gym: {
                  select: {
                    gymName: true,
                    location: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
              take: 50,
            })
          : Promise.resolve([]),
      ]);

    return (
      <div className="mx-auto max-w-7xl space-y-8 bg-slate-50 px-4 py-6 sm:space-y-12 sm:px-6 md:px-10">
        <header className="border-b pb-8">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 sm:text-5xl">
            Super <span className="text-indigo-600">Control</span>
          </h1>
          <p className="text-slate-500 font-medium">Global platform overview and gym management.</p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-indigo-50">
            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Total Active Gyms</p>
            <p className="text-3xl font-black text-slate-800 sm:text-5xl">{totalGyms}</p>
          </div>
          <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-indigo-50">
            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Global Users</p>
            <p className="text-3xl font-black text-slate-800 sm:text-5xl">{totalUsers}</p>
          </div>
          <Link href="/super-admin/register-gym" className="p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center font-black text-xl italic text-center no-underline">
            + REGISTER NEW GYM
          </Link>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-slate-800 italic uppercase">Pending Admin Approvals</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {pendingAdminRequests.length === 0 ? (
              <p className="p-6 text-sm font-bold italic text-slate-500">
                No pending admin requests.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="p-4">Email</th>
                      <th className="p-4">Branch</th>
                      <th className="p-4">Requested At</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pendingAdminRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50">
                        <td className="p-4 text-sm font-semibold text-slate-700">{request.email}</td>
                        <td className="p-4 text-sm text-slate-600">
                          {request.gym?.gymName || "No Branch"}{" "}
                          {request.gym?.location ? `(${request.gym.location})` : ""}
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-500">
                          {new Date(request.createdAt).toLocaleString("en-PK")}
                        </td>
                        <td className="p-4">
                          <AdminRequestActions userId={request.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-slate-800 italic uppercase">Onboarded Gyms</h2>
          <div className="grid gap-4">
            {gyms.map(gym => (
              <div key={gym.id} className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-3 w-3">
                    {gym._count.users > 0 && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${gym._count.users > 0 ? 'bg-green-500' : 'bg-red-400'}`}></span>
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">{gym.gymName}</h3>
                    <p className="text-sm text-slate-500 font-medium">
                      {gym.location} • <span className="text-indigo-600 font-bold">{gym._count.users} Users</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={`/dashboard/gym/${gym.id}`} className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-colors">Logs</Link>
                  <EditGymModal gym={gym} />
                  <DeleteGymBtn gymId={gym.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Common DB User Fetch for Other Roles
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      memberProfile: {
        include: { 
          trainer: true,
          requests: { orderBy: { createdAt: 'desc' }, take: 5 },
          plans: { orderBy: { createdAt: 'desc' }, take: 5 }
        }
      },
      trainerProfile: true 
    }
  });

  if (!dbUser) return <div className="p-10 text-center font-black uppercase">Data Connection Error</div>;

  // --- 2. ADMIN VIEW ---
  if (userRole === "ADMIN") {
    const [pendingPayments, activeMembers] = await Promise.all([
      prisma.payment.findMany({
        where: { status: "PENDING", member: { user: { gymId: userGymId } } },
        select: {
          id: true,
          amount: true,
          receiptUrl: true,
          memberId: true,
          member: { select: { name: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 25,
      }),
      prisma.member.findMany({
        where: { status: "ACTIVE", user: { gymId: userGymId } }
      })
    ]);

    return (
      <div className="mx-auto max-w-7xl space-y-8 bg-gray-50 px-4 py-6 sm:space-y-12 sm:px-6 md:px-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 sm:pb-8">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight italic uppercase">ADMIN <span className="text-indigo-600">HQ</span></h1>
            <p className="text-gray-500 font-medium mt-2">Branch Context: <span className="text-indigo-600 font-black uppercase">Active Branch</span></p>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center min-w-[120px]">
            <p className="text-[10px] font-black uppercase text-gray-400">Total Members</p>
            <p className="text-2xl font-black text-indigo-600">{activeMembers.length}</p>
          </div>
        </header>
        <section>
          <h2 className="text-2xl font-black mb-6 text-gray-800 flex items-center gap-3 italic uppercase">💳 Verification Logs</h2>
          <AdminPaymentList payments={pendingPayments} />
        </section>
        <section className="bg-slate-900 p-4 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] text-white shadow-xl">
          <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 italic uppercase flex items-center gap-2"><Settings size={22} /> Gym Configuration</h2>
          <div className="bg-white/5 p-3 sm:p-6 md:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-white/10"><GymProfileForm /></div>
        </section>
      </div>
    );
  }

  // --- 3. TRAINER VIEW ---
  // --- 3. TRAINER VIEW (Strict Filter Applied) ---
  if (userRole === "TRAINER") {
    // Agar trainer profile nahi bani to setup form dikhao
    if (!dbUser.trainerProfile) {
      return <div className="p-10"><TrainerSetupForm /></div>;
    }

    const trainerId = dbUser.trainerProfile.id;
    const currentPage = Math.max(Number.parseInt(resolvedSearchParams?.page || "1", 10) || 1, 1);
    const pageSize = 10;

    const totalAssignedMembers = await prisma.member.count({
      where: { trainerId },
    });

    const totalPages = Math.max(1, Math.ceil(totalAssignedMembers / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const skip = (safePage - 1) * pageSize;

    const [myMembers, pendingRequests] = await Promise.all([
      // Filter 1: Sirf wo members jo is trainer ko assign hain
      prisma.member.findMany({ 
        where: { trainerId: trainerId },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: { name: 'asc' }
      }),
      
      // Filter 2: Sirf wo PENDING requests jin ka member is trainer ka client hai
      prisma.request.findMany({
        where: {
          status: "PENDING",
          member: {
            trainerId: trainerId // <--- Security Filter
          }
        },
        include: {
          member: true 
        },
        orderBy: {
          createdAt: "desc"
        }
      })
    ]);

    const buildPageHref = (page: number) => {
      const params = new URLSearchParams();
      if (page > 1) params.set("page", String(page));
      const query = params.toString();
      return query ? `/dashboard?${query}` : "/dashboard";
    };

    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:space-y-12 sm:px-6 md:px-10">
        <header>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter sm:text-5xl">
            COACH <span className="text-indigo-600">{dbUser.trainerProfile.name}</span>
          </h1>
          <p className="text-gray-400 font-black uppercase text-xs tracking-[0.2em] mt-2">
            Managing {totalAssignedMembers} Active Athletes
          </p>
        </header>

        {/* PENDING ACTIONS SECTION */}
        {pendingRequests.length > 0 ? (
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase italic text-amber-500 flex items-center gap-2">
              <span className="h-3 w-3 bg-amber-500 rounded-full animate-ping" />
              Pending Actions ({pendingRequests.length})
            </h2>
            <div className="grid gap-4">
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-6 bg-amber-50 border-2 border-amber-100 rounded-[2rem] flex justify-between items-center shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-amber-200 text-amber-800 rounded-md uppercase">
                        {req.type}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{req.member.name}</span>
                    </div>
                    <p className="text-gray-600 text-sm italic">"{req.message}"</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <ApproveButton requestId={req.id} />
                    <Link 
                      href={`/dashboard/members/${req.memberId}`}
                      className="px-6 py-3 bg-amber-500 hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Create Plan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="p-8 border-2 border-dashed rounded-[2rem] text-center text-gray-400 font-bold uppercase text-xs italic">
            No pending requests for your athletes.
          </div>
        )}

        {/* MY ATHLETES SECTION */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black uppercase italic text-gray-800">My Athletes</h2>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {myMembers.length > 0 ? (
              <Table>
                <TableHeader className="bg-slate-100/70">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">NAME</TableHead>
                    <TableHead className="font-bold text-slate-700">EMAIL</TableHead>
                    <TableHead className="font-bold text-slate-700">JOINING DATE</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">PROFILE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myMembers.map((m) => (
                    <TableRow key={m.id} className="hover:bg-slate-50">
                      <TableCell className="font-semibold">
                        <Link href={`/dashboard/members/${m.id}`} className="text-slate-900 hover:text-indigo-600 underline-offset-4 hover:underline">
                          {m.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-700">{m.user.email}</TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(m.joinedAt).toLocaleDateString("en-PK")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/dashboard/members/${m.id}`}
                          className="inline-flex text-[10px] font-black px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full uppercase hover:bg-indigo-100"
                        >
                          Client Hub
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="p-6 text-gray-500 italic">You don't have any athletes assigned yet.</p>
            )}
          </div>
          {totalAssignedMembers > 0 && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
              <p className="text-gray-500">
                Showing {skip + 1}-{Math.min(skip + pageSize, totalAssignedMembers)} of {totalAssignedMembers} athletes (Page {safePage}/{totalPages})
              </p>
              <div className="flex items-center gap-2">
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
          )}
        </section>
      </div>
    );
  }
  

  // --- 4. MEMBER VIEW ---
  if (userRole === "MEMBER") {
    if (!dbUser.memberProfile) return <div className="p-10"><MemberSetupForm /></div>;

    const expiryDate = dbUser.memberProfile.expiresAt;
    const isExpired = dbUser.memberProfile.status === "EXPIRED" || (expiryDate && new Date() > expiryDate);

    return (
      <div className="mx-auto max-w-5xl space-y-8 bg-white px-4 py-6 sm:space-y-10 sm:px-6 md:px-10">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b pb-8">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900 sm:text-6xl">FLEX<span className="text-indigo-600">PRO</span></h1>
            <p className="mt-1 text-base font-bold uppercase italic text-slate-400 underline decoration-indigo-100 underline-offset-8 sm:text-xl">Athlete: {dbUser.memberProfile.name}</p>
          </div>
        </header>

        {isExpired && (
          <div className="p-12 bg-slate-950 border-[6px] border-indigo-600 rounded-[4rem] text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CreditCard size={150} className="text-white rotate-12" />
            </div>
            <div className="relative z-10">
              <h2 className="text-5xl font-black text-white mb-3 italic uppercase tracking-tighter">Access <span className="text-indigo-500 underline decoration-indigo-500/30">Locked</span></h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-10 max-w-xs mx-auto">Aapki subscription expire ho chuki hai. Pay karein.</p>
              <div className="max-w-xs mx-auto"><StripeButton memberId={dbUser.memberProfile.id} amount={2000} /></div>
              <p className="mt-6 text-slate-600 text-[10px] font-black uppercase italic">* Automatic unblocking after payment.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CheckInButton memberId={dbUser.memberProfile.id} />
          <GoalEditor memberId={dbUser.memberProfile.id} initialGoal={dbUser.memberProfile.fitnessGoal} />
          <Link 
            href={dbUser.memberProfile.trainerId ? `/dashboard/trainers/${dbUser.memberProfile.trainerId}` : "#"}
            className="block group transition-transform hover:scale-[1.05]">
            <div className="p-8 bg-slate-900 rounded-[2.5rem] flex flex-col justify-center shadow-2xl border-b-8 border-indigo-600 h-full">
              <p className="text-[10px] font-black uppercase text-indigo-400 mb-1 tracking-widest flex items-center gap-2"><Rocket size={12} /> ASSIGNED COACH</p>
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{dbUser.memberProfile.trainer?.name || "Unassigned"}</h3>
              {dbUser.memberProfile.trainerId && <p className="text-[9px] text-indigo-500 font-bold uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity">View Profile →</p>}
            </div>
          </Link>
        </div>

        <MemberRequestSection 
          memberId={dbUser.memberProfile.id} 
          requests={dbUser.memberProfile.requests} 
        />

        <section className="mt-12 bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 underline decoration-indigo-500/20 flex items-center gap-3">
            <Activity className="text-indigo-600" /> Training <span className="text-indigo-600">Regime</span>
          </h2>
          <div className="space-y-4">
            {dbUser.memberProfile.plans.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-black uppercase italic text-[10px]">No workout protocols assigned yet</p>
                </div>
            ) : (
                dbUser.memberProfile.plans.map(plan => (
                <div key={plan.id} className="p-6 bg-slate-50 rounded-3xl border border-gray-100 flex justify-between items-center group hover:bg-indigo-600 hover:text-white transition-all duration-300">
                    <div className="flex items-center">
                      <span className="text-[10px] font-black px-3 py-1 bg-white text-indigo-600 rounded-full uppercase italic mr-4 shadow-sm">{plan.type}</span>
                      <span className="font-black italic uppercase tracking-tighter">{(plan.content as any)?.workoutDetails || "Standard Workout"}</span>
                    </div>
                    <span className="text-[10px] font-bold opacity-40 group-hover:opacity-100 uppercase">{new Date(plan.createdAt).toLocaleDateString()}</span>
                </div>
                ))
            )}
          </div>
        </section>
      </div>
    );
  }

  return <div className="p-10 text-center font-black text-gray-400 uppercase text-2xl italic">System Access Denied</div>;
}
