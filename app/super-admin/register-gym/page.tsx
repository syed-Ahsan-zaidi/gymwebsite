"use client";

import { registerGymAction } from "@/app/actions/registerGym";
import { BackNavigation } from "@/components/back-navigation";

export default function RegisterGymPage() {
  // ✅ Wrapper function jo error ko handle kare
  async function handleFormAction(formData: FormData) {
    const result = await registerGymAction(formData);
    
    if (result?.error) {
      // Aap yahan toast ya alert dikha sakte hain
      alert(result.error);
    } else {
      alert("Gym and Admin created successfully!");
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-50 flex items-center justify-center p-6">
      
      <BackNavigation />

      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-indigo-50">
        <h1 className="text-3xl font-black text-slate-900 mb-2 italic">
          ONBOARD <span className="text-indigo-600">NEW GYM</span>
        </h1>
        <p className="text-slate-500 font-medium mb-8 text-sm">
          Create a new tenant on the FlexManage platform.
        </p>
        
        {/* ✅ form action ko update kiya */}
        <form action={handleFormAction} className="space-y-4">
          <input 
            name="gymName" 
            placeholder="Gym Name (e.g. Iron Paradise)" 
            className="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold focus:ring-2 focus:ring-indigo-600 outline-none" 
            required 
          />
          <input 
            name="location" 
            placeholder="City / Branch Location" 
            className="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold focus:ring-2 focus:ring-indigo-600 outline-none" 
            required 
          />
          
          <hr className="my-6 border-slate-100" />
          
          <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">
            Admin Credentials
          </p>
          
          <input 
            name="adminEmail" 
            type="email" 
            placeholder="Admin Email" 
            className="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold focus:ring-2 focus:ring-indigo-600 outline-none" 
            required 
          />
          <input 
            name="adminPassword" 
            type="password" 
            placeholder="Admin Password" 
            className="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold focus:ring-2 focus:ring-indigo-600 outline-none" 
            required 
          />
          
          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-indigo-700 transition-all mt-4"
          >
            CREATE GYM & ADMIN
          </button>
        </form>
      </div>
    </div>
  );
}
