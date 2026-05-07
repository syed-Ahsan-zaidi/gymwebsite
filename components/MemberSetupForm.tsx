"use client";
import { useState } from "react";

export default function MemberSetupForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      // 1. Pehle Profile Save karein
      const res = await fetch("/api/member/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const memberResult = await res.json();

      if (res.ok && memberResult.id) {
        // 2. Profile save hotay hi Stripe Checkout session banayein
        const stripeRes = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            memberId: memberResult.id, 
            amount: 3000 // Aapka standard rate
          }),
        });

        const stripeData = await stripeRes.json();

        if (stripeData.url) {
          window.location.href = stripeData.url;
        } else {
          alert("Profile saved, but payment link failed. Please login again.");
        }
      } else {
        alert("Error saving profile: " + (memberResult.error || "Unknown error"));
      }
    } catch (err) {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-6 w-full max-w-md rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-2xl sm:mt-10 sm:p-10">
      <h2 className="mb-6 text-3xl font-black uppercase italic tracking-tighter text-slate-900 sm:text-4xl">
        Start Your <span className="text-indigo-600">Journey</span>
      </h2>
      <p className="text-gray-400 text-xs font-bold uppercase mb-8 tracking-widest">Complete profile to proceed to payment</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="name" placeholder="Full Name" className="bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" required />
        <input name="phoneNumber" placeholder="WhatsApp Number" className="bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" required />
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input name="age" type="number" placeholder="Age" className="bg-slate-50 border-none p-4 rounded-2xl" required />
          <input name="weight" type="number" step="0.1" placeholder="Weight (kg)" className="bg-slate-50 border-none p-4 rounded-2xl" required />
        </div>

        <input name="height" type="number" step="0.1" placeholder="Height (cm)" className="bg-slate-50 border-none p-4 rounded-2xl" required />
        <input name="fitnessGoal" placeholder="Goal (e.g., Weight Loss)" className="bg-slate-50 border-none p-4 rounded-2xl" required />
        
        <textarea name="medicalHistory" placeholder="Medical History (Optional)" className="bg-slate-50 border-none p-4 rounded-2xl h-24" />
        
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase italic tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          {loading ? "Creating Profile..." : "Save & Pay Now"}
        </button>
      </form>
    </div>
  );
}