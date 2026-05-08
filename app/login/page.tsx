"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link" // Naya import
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card" // CardFooter add kiya
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const res = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password: password,
        redirect: false,
      })

      if (res?.error) {
        setError("Ghalat Email ya Password! Dubara koshish karein.")
      } else if (res?.ok) {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("Server se rabta nahi ho pa raha.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <Card className="w-full max-w-md shadow-2xl border-none rounded-[2rem]">
        <CardHeader className="space-y-1 text-center pt-8">
          <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
            Welcome <span className="text-blue-600">Back</span>
          </CardTitle>
          <CardDescription className="font-medium text-slate-500 italic">
            login your own account 
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-xs font-bold uppercase italic">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold uppercase italic">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="name@example.com"
                className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:ring-blue-600"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:ring-blue-600"
                required 
              />
            </div>
            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase italic tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Login Now"}
            </Button>
          </form>
        </CardContent>

        {/* NAYA SECTION: Register Link */}
        <CardFooter className="flex flex-col border-t border-slate-50 mt-6 py-6 text-center">
          <p className="text-sm text-slate-500 font-medium italic">
            No? 
          </p>
          <Link 
            href="/register" 
            className="mt-1 text-blue-600 font-black uppercase text-xs tracking-widest hover:underline decoration-2 underline-offset-4"
          >
            Become a Member
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
