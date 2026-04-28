import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import GymProfileForm from "@/components/GymProfileForm";
import { Settings, CreditCard, Building2, ShieldCheck } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Check if user is Admin (Settings sirf admin ke liye honi chahiye)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (user?.role !== "ADMIN") {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-gray-500">Only Admins can access gym settings.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10 min-h-screen">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-indigo-600 rounded-2xl text-white">
              <Settings size={28} />
           </div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight">Settings</h1>
        </div>
        <p className="text-gray-500 font-medium">Configure your gym identity and payment gateways.</p>
      </header>

      <div className="grid gap-8">
        {/* Section 1: Gym Profile & Payments */}
        <section className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <CreditCard size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-800">Payment & Identity</h2>
          </div>
          
          {/* Ye aapka purana form hai jo database mein gym details save karta hai */}
          <GymProfileForm />
        </section>

        {/* Section 2: Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
            <Building2 className="text-indigo-600 mb-3" size={24} />
            <h3 className="font-bold text-indigo-900">Gym Identity</h3>
            <p className="text-sm text-indigo-700/70 mt-1">
              Yeh details members ko unke dashboard aur receipts par nazar aayengi.
            </p>
          </div>

          <div className="p-6 bg-green-50 rounded-[2rem] border border-green-100">
            <ShieldCheck className="text-green-600 mb-3" size={24} />
            <h3 className="font-bold text-green-900">Security</h3>
            <p className="text-sm text-green-700/70 mt-1">
              Aapka data encrypted hai aur sirf authorized staff hi access kar sakta hai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
