"use client";
import { useState } from "react";
import { Loader2, UploadCloud, CheckCircle } from "lucide-react";

export default function PaymentUploadForm({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Safety Checks
    if (!file) return;
    if (!paymentId) {
      alert("Payment ID missing! Page refresh karke dobara try karein.");
      return;
    }

    // File size check (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size bohot bari hai! 2MB se kam ki image upload karein.");
      return;
    }

    setLoading(true);

    // Form Data tayyar karna
    const formData = new FormData();
    formData.append("file", file);
    formData.append("paymentId", paymentId);

    try {
      // Asli API Call jo humne route.ts mein banayi hai
      const res = await fetch("/api/payment/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setDone(true);
        alert("Screenshot uploaded successfully! Admin verification ka intezar karein.");
        
        // Page refresh taake dashboard status update ho jaye
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert("Upload fail hua: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Network masla aaya. Check karein ke server chal raha hai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      {done ? (
        <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-6 py-3 rounded-full border border-green-200">
          <CheckCircle size={20} />
          Receipt Submitted
        </div>
      ) : (
        <label className="group cursor-pointer bg-white border-2 border-orange-200 hover:border-orange-500 hover:bg-orange-50 px-8 py-5 rounded-3xl flex flex-col items-center gap-3 transition-all shadow-sm">
          {loading ? (
            <Loader2 className="animate-spin text-orange-600" size={32} />
          ) : (
            <UploadCloud className="text-orange-600 group-hover:scale-110 transition-transform" size={32} />
          )}
          
          <div className="text-center">
            <span className="block font-black text-orange-900 text-lg">
              {loading ? "Uploading..." : "Select Screenshot"}
            </span>
            <span className="text-xs text-orange-400 font-medium">PNG, JPG or JPEG</span>
          </div>

          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange} 
            disabled={loading} 
          />
        </label>
      )}
      
      <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-[0.2em] font-bold">
        Step 2: Proof of Payment
      </p>
    </div>
  );
}
