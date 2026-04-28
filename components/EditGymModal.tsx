"use client";
import { useState } from "react";
import { updateGymByAdmin } from "@/app/actions/gymActions";

export default function EditGymModal({ gym }: { gym: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await updateGymByAdmin(gym.id, formData);
    setLoading(false);
    if (result.success) {
      setIsOpen(false);
      alert("Gym Updated Successfully!");
    }
  }

  return (
    <>
      {/* Edit Button Icon */}
      <button onClick={() => setIsOpen(true)} className="text-gray-400 hover:text-blue-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Gym Details</h2>
            
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">GYM NAME</label>
                <input 
                  name="gymName" 
                  defaultValue={gym.gymName} 
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">LOCATION</label>
                <input 
                  name="location" 
                  defaultValue={gym.location} 
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
