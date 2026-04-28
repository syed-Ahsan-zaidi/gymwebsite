"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrainerSetupForm() {
  const [formData, setFormData] = useState({
    name: "",
    experience: "",
    specialization: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/trainer/setup", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (res.ok) router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Trainer Profile Setup</h2>
      <div className="space-y-4">
        <input 
          type="text" placeholder="Professional Name" required
          className="w-full p-3 border rounded-lg"
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <input 
          type="number" placeholder="Years of Experience" required
          className="w-full p-3 border rounded-lg"
          onChange={(e) => setFormData({...formData, experience: e.target.value})}
        />
        <input 
          type="text" placeholder="Specialization (e.g. Bodybuilding, Yoga)" required
          className="w-full p-3 border rounded-lg"
          onChange={(e) => setFormData({...formData, specialization: e.target.value})}
        />
        <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">
          Create Trainer Profile
        </button>
      </div>
    </form>
  );
}
