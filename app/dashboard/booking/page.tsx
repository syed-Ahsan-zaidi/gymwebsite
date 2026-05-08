"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type BookingRow = {
  id: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  member: { name: string; user: { email: string } };
};

export default function TrainerBookingPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?page=${page}`);
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [page]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const statusActions = useMemo(
    () => ["CONFIRMED", "COMPLETED", "CANCELLED"] as const,
    []
  );

  const updateStatus = async (id: string, status: (typeof statusActions)[number]) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      loadBookings();
    } else {
      alert("Status update failed");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-black uppercase italic">Booking Management</h1>

      <div className="bg-white border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-max">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              <th className="p-3 text-left whitespace-nowrap">Member</th>
              <th className="p-3 text-left whitespace-nowrap">Email</th>
              <th className="p-3 text-left whitespace-nowrap">Start</th>
              <th className="p-3 text-left whitespace-nowrap">End</th>
              <th className="p-3 text-left whitespace-nowrap">Status</th>
              <th className="p-3 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">
                  {loading ? "Loading..." : "No bookings found"}
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-semibold whitespace-nowrap">{booking.member.name}</td>
                  <td className="p-3 whitespace-nowrap">{booking.member.user.email}</td>
                  <td className="p-3 whitespace-nowrap">{new Date(booking.startTime).toLocaleString("en-PK")}</td>
                  <td className="p-3 whitespace-nowrap">{new Date(booking.endTime).toLocaleString("en-PK")}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="inline-block px-2 py-1 rounded-md text-xs font-semibold bg-slate-100">
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {statusActions.map((status) => (
                        <Button
                          key={status}
                          variant="outline"
                          className="h-7 px-1.5 text-xs"
                          onClick={() => updateStatus(booking.id, status)}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <p className="text-slate-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button disabled={!canPrev} variant="outline" onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button disabled={!canNext} variant="outline" onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
