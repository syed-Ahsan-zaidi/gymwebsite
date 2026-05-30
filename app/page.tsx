import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <header className="flex justify-center pt-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
          </div>
          <span className="text-4xl font-black tracking-tighter text-slate-900">
            FlexManage<span className="text-blue-600">Pro</span>
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl text-5xl md:text-6xl font-black text-slate-900 leading-tight uppercase italic mb-0">
          Elevate Your <span className="text-blue-600">Gym Experience</span>
        </h1>

        <p className="mt-6 max-w-lg text-slate-500 font-medium text-lg">
          The all-in-one management system for gym owners and athletes.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-md">
          {!session ? (
            <>
              <Link href="/register" className="flex-1">
                <button className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1">
                  Become a Member
                </button>
              </Link>
              <Link href="/login" className="flex-1">
                <button className="w-full h-14 bg-white text-slate-900 border-2 border-slate-900 rounded-2xl font-black uppercase italic tracking-widest hover:bg-slate-50 transition-all">
                  Login
                </button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard" className="w-full">
              <button className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-2xl hover:bg-black transition-all">
                Go to Dashboard
              </button>
            </Link>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
        <p>© 2026 FlexManage Pro • Premium Fitness Management</p>
      </footer>
    </div>
  );
}
