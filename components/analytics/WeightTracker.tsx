"use client";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function WeightTracker({ data = [] }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-[300px] bg-slate-50 animate-pulse rounded-xl" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
        <p className="font-medium">No weight logs found.</p>
        <p className="text-xs">Add data to see the chart.</p>
      </div>
    );
  }

  return (
    /* FINAL FIX: Style mein height aur minHeight dono 300px kar di hain. 
       Is se ResponsiveContainer ko 0 ya -1 milne ka sawal hi paida nahi hota. */
    <div className="w-full" style={{ height: '300px', minHeight: '300px', position: 'relative' }}>
      <ResponsiveContainer width="99%" height="99%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
            }} 
          />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="#2563eb"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorWeight)"
            isAnimationActive={false} // Debugging ke liye animation off ki hai
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
