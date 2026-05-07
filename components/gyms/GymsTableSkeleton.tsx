import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function GymsTableSkeleton() {
  return (
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
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index} className="hover:bg-slate-50">
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-8 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Skeleton for pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
    </div>
  );
}