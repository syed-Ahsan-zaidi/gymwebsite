"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Slot = {
  id: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  weekday: number | null;
};

type GroupClass = {
  id: string;
  title: string;
  classType: string;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolledCount?: number;
  enrollments?: Array<{ id: string }>;
};

export default function TrainerSchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [classes, setClasses] = useState<GroupClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [slotRecurring, setSlotRecurring] = useState(false);
  const [slotWeekday, setSlotWeekday] = useState("1");

  const [classTitle, setClassTitle] = useState("");
  const [classType, setClassType] = useState("");
  const [classStart, setClassStart] = useState("");
  const [classEnd, setClassEnd] = useState("");
  const [classCapacity, setClassCapacity] = useState("10");

  const loadSlots = useCallback(async () => {
    try {
      const slotsRes = await fetch("/api/trainer/slots");
      if (!slotsRes.ok) {
        throw new Error("Server response failed");
      }
      const slotsData = await slotsRes.json();
      setSlots(slotsData.slots ?? []);
    } catch (error) {
      console.error("Failed to load slots:", error);
    }
  }, []);

  const loadClasses = useCallback(async () => {
    try {
      const classesRes = await fetch("/api/classes?page=1");
      if (!classesRes.ok) {
        throw new Error("Server response failed");
      }
      const classesData = await classesRes.json();
      setClasses(classesData.classes ?? []);
    } catch (error) {
      console.error("Failed to load classes:", error);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([loadSlots(), loadClasses()]);
    } finally {
      setLoading(false);
    }
  }, [loadClasses, loadSlots]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Slot Creation with Validation
  const createSlot = async (e: FormEvent) => {
    e.preventDefault();

    // Time Validation Check
    const start = new Date(slotStart);
    const end = new Date(slotEnd);

    if (start >= end) {
      alert("Galti: End Time hamesha Start Time se zyada hona chahiye.");
      return;
    }

    try {
      const res = await fetch("/api/trainer/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: slotStart,
          endTime: slotEnd,
          isRecurring: slotRecurring,
          weekday: Number(slotWeekday),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create slot");
        return;
      }

      setSlotStart("");
      setSlotEnd("");
      setSlotRecurring(false);
      setSlotWeekday("1");
      loadSlots();
    } catch (err) {
      alert("Something went wrong");
    }
  };

  // Class Creation with Validation
  const createClass = async (e: FormEvent) => {
    e.preventDefault();

    const start = new Date(classStart);
    const end = new Date(classEnd);

    if (start >= end) {
      alert("Galti: Class ka End Time valid nahi hai.");
      return;
    }

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: classTitle,
          classType,
          startTime: classStart,
          endTime: classEnd,
          capacity: Number(classCapacity),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create class");
        return;
      }

      setClassTitle("");
      setClassType("");
      setClassStart("");
      setClassEnd("");
      setClassCapacity("10");
      loadClasses();
    } catch (err) {
      alert("Something went wrong");
    }
  };

  const removeSlot = async (slotId: string) => {
    const res = await fetch(`/api/trainer/slots/${slotId}`, { method: "DELETE" });
    if (res.ok) loadSlots();
  };

  const removeClass = async (classId: string) => {
    const res = await fetch(`/api/classes/${classId}`, { method: "DELETE" });
    if (res.ok) loadClasses();
  };

  const getEnrolledCount = (groupClass: GroupClass) => {
    if (typeof groupClass.enrolledCount === "number") {
      return groupClass.enrolledCount;
    }
    return groupClass.enrollments?.length ?? 0;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 md:px-10">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-black uppercase italic text-slate-900 sm:text-3xl">Schedule Management</h1>
        {loading && <span className="text-sm animate-pulse text-blue-600 font-medium">Refreshing...</span>}
      </div>

      {/* Availability Slots Section */}
      <section className="bg-white rounded-2xl border p-4 md:p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Availability Slots</h2>
        <form onSubmit={createSlot} className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <Input 
            type="datetime-local" 
            value={slotStart} 
            onChange={(e) => setSlotStart(e.target.value)} 
            required 
          />
          <Input 
            type="datetime-local" 
            value={slotEnd} 
            onChange={(e) => setSlotEnd(e.target.value)} 
            required 
          />
          <label className="flex items-center gap-2 text-sm border rounded-md px-3 bg-slate-50 cursor-pointer">
            <input type="checkbox" checked={slotRecurring} onChange={(e) => setSlotRecurring(e.target.checked)} />
            Recurring
          </label>
          <Input
            type="number"
            min={0}
            max={6}
            value={slotWeekday}
            onChange={(e) => setSlotWeekday(e.target.value)}
            disabled={!slotRecurring}
            placeholder="Weekday (0-6)"
          />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-bold">Add Slot</Button>
        </form>

        <div className="overflow-auto rounded-lg border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b">
                <th className="p-3 text-left font-semibold">Start</th>
                <th className="p-3 text-left font-semibold">End</th>
                <th className="p-3 text-left font-semibold">Recurring</th>
                <th className="p-3 text-left font-semibold">Weekday</th>
                <th className="p-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {slots.map((slot) => (
                <tr key={slot.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">{new Date(slot.startTime).toLocaleString("en-PK")}</td>
                  <td className="p-3">{new Date(slot.endTime).toLocaleString("en-PK")}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${slot.isRecurring ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {slot.isRecurring ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="p-3">{slot.weekday ?? "-"}</td>
                  <td className="p-3 text-right">
                    <Button variant="destructive" size="sm" onClick={() => removeSlot(slot.id)}>Remove</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Group Classes Section */}
      <section className="bg-white rounded-2xl border p-4 md:p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Group Classes</h2>
        <form onSubmit={createClass} className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <Input value={classTitle} onChange={(e) => setClassTitle(e.target.value)} placeholder="Class Title" required />
          <Input value={classType} onChange={(e) => setClassType(e.target.value)} placeholder="Type" required />
          <Input type="datetime-local" value={classStart} onChange={(e) => setClassStart(e.target.value)} required />
          <Input type="datetime-local" value={classEnd} onChange={(e) => setClassEnd(e.target.value)} required />
          <Input type="number" min={1} value={classCapacity} onChange={(e) => setClassCapacity(e.target.value)} required />
          <Button type="submit" className="bg-green-600 hover:bg-green-700 font-bold">Create Class</Button>
        </form>

        <div className="overflow-auto rounded-lg border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr className="border-b">
                <th className="p-3 text-left font-semibold">Title</th>
                <th className="p-3 text-left font-semibold">Type</th>
                <th className="p-3 text-left font-semibold">Start</th>
                <th className="p-3 text-left font-semibold">End</th>
                <th className="p-3 text-left font-semibold">Capacity</th>
                <th className="p-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold">{c.title}</td>
                  <td className="p-3">{c.classType}</td>
                  <td className="p-3">{new Date(c.startTime).toLocaleString("en-PK")}</td>
                  <td className="p-3">{new Date(c.endTime).toLocaleString("en-PK")}</td>
                  <td className="p-3">{getEnrolledCount(c)} / {c.capacity}</td>
                  <td className="p-3 text-right">
                    <Button variant="destructive" size="sm" onClick={() => removeClass(c.id)}>Remove</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
