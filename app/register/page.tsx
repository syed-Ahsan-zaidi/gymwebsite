"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Naya import
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // CardFooter add kiya
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Actions
import { registerUser } from "@/app/actions/register";
import { getGyms } from "../actions/gyms";

export default function RegisterPage() {
  const [role, setRole] = useState("MEMBER");
  const [gyms, setGyms] = useState<{ id: string; gymName: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchGymsData() {
      try {
        const data = await getGyms();
        setGyms(data);
      } catch (err) {
        console.error("Failed to load gyms", err);
      }
    }
    fetchGymsData();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await registerUser(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/login?message=Account created! Please login.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem]">
        <CardHeader className="space-y-1 text-center pt-8">
          <CardTitle className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter">
            FlexManage <span className="text-indigo-600">Pro</span>
          </CardTitle>
          <CardDescription className="font-medium italic text-slate-500">
            create new account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 italic uppercase">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Gym Selection */}
            <div className="space-y-2">
              <Label className="ml-1 font-black uppercase text-[10px] text-slate-400 tracking-widest">Select Your Branch</Label>
              <Select name="gymId" required>
                <SelectTrigger className="rounded-xl border-none bg-slate-100 font-bold h-12 text-slate-700">
                  <SelectValue placeholder="Branch select karein" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  {gyms.map((gym) => (
                    <SelectItem key={gym.id} value={gym.id} className="font-bold">
                      {gym.gymName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="ml-1 font-black uppercase text-[10px] text-slate-400 tracking-widest">Aapka Role</Label>
              <Select name="role" onValueChange={setRole} defaultValue="MEMBER">
                <SelectTrigger className="rounded-xl border-none bg-slate-100 font-bold h-12 text-slate-700">
                  <SelectValue placeholder="Role select karein" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  <SelectItem value="MEMBER" className="font-bold">Gym Member</SelectItem>
                  <SelectItem value="TRAINER" className="font-bold">Gym Trainer</SelectItem>
                  <SelectItem value="ADMIN" className="font-bold">Gym Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN" className="font-bold">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="ml-1 font-black uppercase text-[10px] text-slate-400 tracking-widest" htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="email@example.com" required className="rounded-xl border-none bg-slate-100 font-bold h-12" />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="ml-1 font-black uppercase text-[10px] text-slate-400 tracking-widest" htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required className="rounded-xl border-none bg-slate-100 font-bold h-12" />
            </div>

            {/* Secret Key */}
            {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "TRAINER") && (
              <div className="space-y-2 border-l-4 border-indigo-600 bg-indigo-50/50 p-4 rounded-r-2xl animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="adminSecret" className="text-indigo-700 font-black text-[10px] uppercase tracking-widest">
                  {role === "SUPER_ADMIN" ? "Master Admin Secret" : "Staff Authorization Key"}
                </Label>
                <Input 
                  id="adminSecret" 
                  name="adminSecret" 
                  type="password" 
                  placeholder="Enter Secret Key" 
                  required 
                  className="rounded-xl border-none bg-white font-bold h-12 shadow-inner" 
                />
              </div>
            )}

            <Button 
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black text-white transition-all shadow-lg shadow-indigo-100 mt-6 uppercase tracking-widest italic" 
              type="submit" 
              disabled={loading}
            >
              {loading ? "REGISTERING..." : "REGISTER ACCOUNT"}
            </Button>
          </form>
        </CardContent>

        {/* NAYA SECTION: Login Link */}
        <CardFooter className="flex flex-col border-t border-slate-50 mt-6 py-8 text-center">
          <p className="text-sm text-slate-500 font-medium italic">
            before a account ?
          </p>
          <Link 
            href="/login" 
            className="mt-1 text-indigo-600 font-black uppercase text-xs tracking-widest hover:underline decoration-2 underline-offset-4"
          >
            Go to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
