export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
      <h2 className="text-xl font-semibold text-slate-800">Welcome back, Ahsan!</h2>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-bold">
          AZ
        </div>
      </div>
    </header>
  );
}
