"use client";
import { useState } from "react";

export default function MemberPaymentPage() {
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [method, setMethod] = useState("JazzCash");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/payments/request", {
      method: "POST",
      body: JSON.stringify({ amount, transactionId, method }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      alert("Request bhej di gayi hai!");
    } else {
      alert("Error: Shayad Transaction ID pehle use ho chuki hai.");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white shadow-xl rounded-2xl border mt-10">
      <h1 className="text-2xl font-bold mb-6">Fees Jama Karwayen</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="number" 
          placeholder="Amount (e.g. 2000)" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-3 rounded-lg" 
          required 
        />
        <input 
          type="text" 
          placeholder="Transaction ID" 
          value={transactionId} 
          onChange={(e) => setTransactionId(e.target.value)}
          className="w-full border p-3 rounded-lg" 
          required 
        />
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border p-3 rounded-lg">
          <option value="JazzCash">JazzCash</option>
          <option value="EasyPaisa">EasyPaisa</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
          Submit Receipt
        </button>
      </form>
    </div>
  );
}
