"use client";
import { useState } from "react";

export default function GymProfileForm() {
  const [gymName, setGymName] = useState("FlexManage Pro");
  const [location, setLocation] = useState("Main Branch");
  const [facilities, setFacilities] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gymName.trim() || !location.trim() || !facilities.trim()) {
      alert("⚠️ Error: All fields are required!");
      return;
    }

    setLoading(true);

    const facilitiesArray = facilities
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f !== "");

    try {
      const res = await fetch("/api/admin/gym-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gymName: gymName.trim(),
          location: location.trim(),
          facilities: facilitiesArray,
        }),
      });

      if (res.ok) {
        alert("✅ Success! Gym data saved to Neon Database.");
      } else {
        const data = await res.json();
        alert(`❌ Error: ${data.error || "Something went wrong"}`);
      }
    } catch (err) {
      alert("❌ API Connection Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-1 sm:p-2">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-4">Gym Profile Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase">Gym Name</label>
            <input
              type="text"
              required
              placeholder="Enter Gym Name"
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              // Yahan text-black add kiya hai
              className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg text-sm text-black bg-white outline-none focus:ring-1 focus:ring-purple-400 transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase">Location</label>
            <input
              type="text"
              required
              placeholder="Enter Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              // Yahan text-black add kiya hai
              className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg text-sm text-black bg-white outline-none focus:ring-1 focus:ring-purple-400 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase">Facilities (Machines)</label>
          <textarea
            required
            placeholder="Treadmill, Dumbbells, Bench Press..."
            // Yahan text-black add kiya hai
            className="w-full p-3 border border-gray-300 rounded-xl text-sm text-black bg-white min-h-[110px] sm:h-28 outline-none focus:ring-1 focus:ring-purple-400 transition-all"
            value={facilities}
            onChange={(e) => setFacilities(e.target.value)}
          />
          <p className="text-[10px] text-gray-500 mt-1">* Separate machines with commas ( , )</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-700 text-white font-bold py-3 rounded-xl hover:bg-purple-800 transition-all disabled:bg-gray-300 text-sm sm:text-base"
        >
          {loading ? "SYNCING TO NEON..." : "Update Facilities List"}
        </button>
      </form>
    </div>
  );
}
