import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ApprovalRow = {
  id: string
  amount: number
  updatedAt: Date
  member: {
    name: string
    user: {
      gym: {
        gymName: string | null
      } | null
    }
  }
}

type RecentApprovalsTableProps = {
  approvals: ApprovalRow[]
}

function getDisplayName(memberName: string) {
  const cleanedMemberName = memberName?.trim()
  if (cleanedMemberName) return cleanedMemberName

  // Last resort only when both names are missing in DB.
  return "Member"
}

export default function RecentApprovalsTable({ approvals }: RecentApprovalsTableProps) {
  return (
    <div className="w-full bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50/50">
        <h3 className="text-sm font-bold tracking-wider text-gray-700 flex items-center gap-2 uppercase">
          <span className="text-blue-600">🔄</span> Recent Approvals
        </h3>
      </div>
      <div className="md:hidden p-3 space-y-3">
        {approvals.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-100 p-3 bg-white">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-gray-800 text-sm">
                {getDisplayName(item.member.name)}
              </p>
              <p className="text-sm font-bold text-green-600 whitespace-nowrap">
                PKR {item.amount.toLocaleString()}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-1 rounded uppercase whitespace-nowrap">
                {item.member.user.gym?.gymName ?? "No Gym"}
              </span>
              <p className="text-xs text-gray-500 font-medium whitespace-nowrap">
                {new Date(item.updatedAt).toLocaleDateString("en-PK")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table className="w-full min-w-[680px]">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold text-gray-600">NAME</TableHead>
              <TableHead className="font-bold text-gray-600">GYM / LOCATION</TableHead>
              <TableHead className="font-bold text-gray-600">DATE</TableHead>
              <TableHead className="text-right font-bold text-gray-600">AMOUNT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvals.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-semibold text-gray-800">
                  {getDisplayName(item.member.name)}
                </TableCell>
                <TableCell>
                  <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-1 rounded uppercase whitespace-nowrap">
                    {item.member.user.gym?.gymName ?? "No Gym"}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-gray-500 font-medium whitespace-nowrap">
                  {new Date(item.updatedAt).toLocaleDateString("en-PK")}
                </TableCell>
                <TableCell className="text-right font-bold text-green-600 whitespace-nowrap">
                  PKR {item.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
