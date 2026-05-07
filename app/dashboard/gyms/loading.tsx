import { GymsTableSkeleton } from "@/components/gyms/GymsTableSkeleton";

export default function GymsLoading() {
  return (
    <div className="p-10 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">
          Onboarded <span className="text-indigo-600">Gyms</span>
        </h1>
      </div>

      <GymsTableSkeleton />
    </div>
  );
}