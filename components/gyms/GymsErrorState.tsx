"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

interface GymsErrorStateProps {
  error?: string;
  onRetry?: () => void;
}

export function GymsErrorState({ error, onRetry }: GymsErrorStateProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    } else {
      // Fallback: refresh the page
      window.location.reload();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="text-center py-16 px-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Error Loading Gyms
        </h3>
        <p className="text-slate-500 mb-2">
          There was an error loading the gym list. Please try again.
        </p>
        {error && (
          <p className="text-sm text-red-600 mb-6 font-mono bg-red-50 p-2 rounded">
            {error}
          </p>
        )}
        
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}