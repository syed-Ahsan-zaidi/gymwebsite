"use client";
import { useState } from "react";

interface StripeButtonProps {
  memberId: string;
  amount: number;
}

export default function StripeButton({ memberId, amount }: StripeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!memberId) {
      alert("Error: Member ID nahi mili.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ 
          amount: amount, 
          memberId: memberId 
        }), 
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; 
      } else {
        alert("Payment error: " + data.error);
      }
    } catch (err) {
      alert("Error: Payment link nahi ban saka.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePay}
      disabled={loading}
      className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:bg-slate-900 transition-all disabled:opacity-50"
    >
      {loading ? "Processing..." : `PAY PKR ${amount} WITH CARD`}
    </button>
  );
}
