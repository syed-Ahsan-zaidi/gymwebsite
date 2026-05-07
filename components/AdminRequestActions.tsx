"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminRequestActionsProps = {
  userId: string;
};

export default function AdminRequestActions({ userId }: AdminRequestActionsProps) {
  const router = useRouter();
  const [loadingDecision, setLoadingDecision] = useState<"APPROVE" | "REJECT" | null>(null);

  const submitDecision = async (decision: "APPROVE" | "REJECT") => {
    setLoadingDecision(decision);
    try {
      const response = await fetch(`/api/super-admin/admin-requests/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });

      if (!response.ok) {
        const errorPayload = await response.json();
        alert(errorPayload?.error || "Unable to process request");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to process admin request", error);
      alert("Server error. Please try again.");
    } finally {
      setLoadingDecision(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => submitDecision("APPROVE")}
        disabled={loadingDecision !== null}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingDecision === "APPROVE" ? "Approving..." : "Approve"}
      </button>
      <button
        type="button"
        onClick={() => submitDecision("REJECT")}
        disabled={loadingDecision !== null}
        className="rounded-md bg-rose-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingDecision === "REJECT" ? "Rejecting..." : "Reject"}
      </button>
    </div>
  );
}
