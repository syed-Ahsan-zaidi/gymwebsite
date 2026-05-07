"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Slot = {
  id: string;
  trainerId: string;
  startTime?: string;
  endTime?: string;
  generatedStartTime?: string;
  generatedEndTime?: string;
  isRecurring: boolean;
};

type BookingRow = {
  id: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  trainer: { name: string; user: { email: string } };
};

export default function BookSessionPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotValue, setSelectedSlotValue] = useState("");
  const [notes, setNotes] = useState("");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);

  const loadSlots = async () => {
    const now = new Date();
    const from = now.toISOString();
    const to = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch(`/api/trainer/slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    const data = await res.json();
    setSlots(data.slots ?? []);
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const loadBookings = async () => {
    const res = await fetch(`/api/bookings?page=${bookingPage}`);
    const data = await res.json();
    if (res.ok) {
      setBookings(data.bookings ?? []);
      setBookingTotalPages(data.pagination?.totalPages ?? 1);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [bookingPage]);

  const onBook = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSlotValue) {
      alert("Please select a slot");
      return;
    }

    const [slotId, trainerId, startTime, endTime] = selectedSlotValue.split("|");
    if (!slotId || !trainerId || !startTime || !endTime) {
      alert("Invalid slot selection");
      return;
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainerId,
        slotId,
        startTime,
        endTime,
        notes,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Booking failed");
      return;
    }

    setSelectedSlotValue("");
    setNotes("");
    alert("Session booked successfully");
    loadBookings();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 md:px-10">
      <h1 className="text-2xl font-black uppercase italic sm:text-3xl">Book Session</h1>

      <form onSubmit={onBook} className="bg-white border rounded-2xl p-4 md:p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Available Slots (next 14 days)</label>
          <select
            className="w-full border rounded-md h-10 px-3"
            value={selectedSlotValue}
            onChange={(e) => setSelectedSlotValue(e.target.value)}
            required
          >
            <option value="">Select slot</option>
            {slots.map((slot) => {
              const start = slot.generatedStartTime ?? slot.startTime;
              const end = slot.generatedEndTime ?? slot.endTime;
              const value = `${slot.id}|${slot.trainerId}|${start}|${end}`;
              return (
                <option key={`${slot.id}-${start}`} value={value}>
                  {new Date(start as string).toLocaleString("en-PK")} - {new Date(end as string).toLocaleTimeString("en-PK")}
                </option>
              );
            })}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Notes</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional note for trainer"
          />
        </div>

        <Button type="submit">Book Session</Button>
      </form>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Trainer</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Start</th>
              <th className="p-3 text-left">End</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-t">
                <td className="p-3 font-semibold">{booking.trainer.name}</td>
                <td className="p-3">{booking.trainer.user.email}</td>
                <td className="p-3">{new Date(booking.startTime).toLocaleString("en-PK")}</td>
                <td className="p-3">{new Date(booking.endTime).toLocaleString("en-PK")}</td>
                <td className="p-3">{booking.status}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td className="p-4 text-center text-slate-500" colSpan={5}>
                  No booking history yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-2 text-sm sm:flex-row sm:items-center">
        <p className="text-slate-500">
          History page {bookingPage} of {bookingTotalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={bookingPage <= 1}
            onClick={() => setBookingPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={bookingPage >= bookingTotalPages}
            onClick={() => setBookingPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
