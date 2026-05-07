import { Building2, Plus } from "lucide-react";
import Link from "next/link";

interface GymsEmptyStateProps {
  totalCount: number;
  currentPage: number;
}

export function GymsEmptyState({ totalCount, currentPage }: GymsEmptyStateProps) {
  const isNoGymsAtAll = totalCount === 0;
  const isEmptyPage = totalCount > 0 && currentPage > 1;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="text-center py-16 px-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-slate-100 rounded-full">
            <Building2 className="h-12 w-12 text-slate-400" />
          </div>
        </div>
        
        {isNoGymsAtAll ? (
          <>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Gyms Onboarded Yet
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Get started by onboarding your first gym to the FlexManagePro platform.
            </p>
            <Link
              href="/super-admin/register-gym"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Register First Gym
            </Link>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Gyms Found on This Page
            </h3>
            <p className="text-slate-500 mb-6">
              This page doesn't contain any gym records. Try going back to the first page.
            </p>
            <Link
              href="/dashboard/gyms"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Go to First Page
            </Link>
          </>
        )}
      </div>
    </div>
  );
}