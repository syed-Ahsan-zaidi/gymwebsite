import { Role } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { getPaginatedGyms } from "@/app/actions/gyms";
import { extractPageFromSearchParams } from "@/lib/url-utils";
import { GymsEmptyState } from "@/components/gyms/GymsEmptyState";
import { GymsErrorState } from "@/components/gyms/GymsErrorState";

// Props interface for the gyms page component
interface GymsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function GymsListPage({ searchParams }: GymsPageProps) {
  try {
    // Extract and validate page parameter from URL
    const resolvedSearchParams = await searchParams;
    const currentPage = extractPageFromSearchParams(resolvedSearchParams);
    
    // Fetch paginated gym data using the enhanced gym actions
    const { gyms, pagination } = await getPaginatedGyms({
      page: currentPage,
      pageSize: 10,
    });

    return (
      <div className="p-10 space-y-8 bg-slate-50 min-h-screen">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Onboarded <span className="text-indigo-600">Gyms</span>
          </h1>
        </div>

        {/* Show empty state if no gyms */}
        {gyms.length === 0 ? (
          <GymsEmptyState 
            totalCount={pagination.totalCount} 
            currentPage={pagination.currentPage} 
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-100/70">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">GYM NAME</TableHead>
                  <TableHead className="font-bold text-slate-700">LOCATION</TableHead>
                  <TableHead className="font-bold text-slate-700">ADMIN EMAIL</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">MEMBERS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gyms.map((gym) => {
                  const gymAdmin = gym.users.find((user) => user.role === Role.ADMIN);
                  // Use the optimized member count from the paginated response
                  const membersCount = gym._count.users;

                  return (
                    <TableRow key={gym.id} className="hover:bg-slate-50">
                      <TableCell className="font-semibold text-slate-900 uppercase">{gym.gymName}</TableCell>
                      <TableCell className="text-slate-600 uppercase">{gym.location}</TableCell>
                      <TableCell className="text-slate-700">
                        {gymAdmin?.email ?? "No admin assigned"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-indigo-600">{membersCount}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {/* Add pagination component below the table */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              baseUrl="/dashboard/gyms"
            />
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading gyms page:", error);
    
    // Extract error message for display
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Return enhanced error state UI for server component
    return (
      <div className="p-10 space-y-8 bg-slate-50 min-h-screen">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Onboarded <span className="text-indigo-600">Gyms</span>
          </h1>
        </div>

        <GymsErrorState error={errorMessage} />
      </div>
    );
  }
}