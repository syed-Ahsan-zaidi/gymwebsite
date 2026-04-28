"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export function BackNavigation() {
  const router = useRouter();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => router.back()}
      className="absolute top-6 left-6 gap-1 text-slate-500 hover:text-slate-900"
    >
      <ChevronLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
