"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type ClassRow = {
  id: string;
  title: string;
  classType: string;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolledCount: number;
  isEnrolled: boolean;
  trainer: { name: string };
};

export default function MemberClassesPage() {
  const [rows, setRows] = useState<ClassRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    const res = await fetch(`/api/classes?page=${page}`);
    const data = await res.json();
    if (res.ok) {
      setRows(data.classes ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const enroll = async (id: string) => {
    const res = await fetch(`/api/classes/${id}/enroll`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Enroll failed");
      return;
    }
    load();
  };

  const unenroll = async (id: string) => {
    const res = await fetch(`/api/classes/${id}/unenroll`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Unenroll failed");
      return;
    }
    load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 md:px-10">
      <h1 className="text-2xl font-black uppercase italic sm:text-3xl">Classes</h1>
      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Trainer</th>
              <th className="p-3 text-left">Start</th>
              <th className="p-3 text-left">Seats Left</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const seatsLeft = Math.max(0, row.capacity - row.enrolledCount);

              return (
                <tr key={row.id} className="border-t">
                  <td className="p-3 font-semibold">{row.title}</td>
                  <td className="p-3">{row.classType}</td>
                  <td className="p-3">{row.trainer.name}</td>
                  <td className="p-3">{new Date(row.startTime).toLocaleString("en-PK")}</td>
                  <td className="p-3">{seatsLeft}</td>
                  <td className="p-3 text-right">
                    {row.isEnrolled ? (
                      <Button variant="outline" className="h-8" onClick={() => unenroll(row.id)}>
                        Cancel
                      </Button>
                    ) : (
                      <Button className="h-8" onClick={() => enroll(row.id)} disabled={seatsLeft < 1}>
                        Enroll
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">
                  No classes available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-2 text-sm sm:flex-row sm:items-center">
        <p className="text-slate-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
