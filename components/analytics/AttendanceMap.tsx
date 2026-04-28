"use client"
import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface HeatmapValue {
  date: string;
  count: number;
}

interface AttendanceMapProps {
  data?: HeatmapValue[];
}

export default function AttendanceMap({ data = [] }: AttendanceMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date();
  // Pura saal dikhane ke liye
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const safeData = Array.isArray(data) ? data : [];

  if (!mounted) return <div className="h-40 w-full bg-slate-50 animate-pulse rounded-xl" />;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 w-full min-h-[250px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-slate-700 uppercase tracking-tight text-sm">Workout Consistency</h3>
        <span className="text-xs font-mono text-slate-400">{today.getFullYear()}</span>
      </div>

      <div className="heatmap-wrapper w-full overflow-x-auto pb-2">
        <div style={{ minWidth: '600px' }}>
          <CalendarHeatmap
            startDate={startOfYear}
            endDate={today}
            values={safeData}
            classForValue={(value) => {
              if (!value || value.count === 0) return 'color-empty';
              return 'color-filled';
            }}
            tooltipDataAttrs={(value: any) => {
              return {
                'data-tooltip-id': 'heatmap-tooltip',
                'data-tooltip-content': value?.date ? `${value.date}: Workout Done` : 'No activity',
              };
            }}
          />
        </div>
        <Tooltip id="heatmap-tooltip" style={{ borderRadius: '8px', fontSize: '12px' }} />
      </div>

      {/* Legend / Key */}
      <div className="flex items-center gap-4 mt-4 border-t border-slate-50 pt-4">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400">
          <div className="w-3 h-3 bg-slate-100 rounded-[2px]"></div>
          <span>Rest</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400">
          <div className="w-3 h-3 bg-blue-600 rounded-[2px]"></div>
          <span>Goal Met</span>
        </div>
      </div>

      <style jsx global>{`
        /* Heatmap Colors Customization */
        .react-calendar-heatmap .color-filled { 
          fill: #2563eb; /* Blue-600 jo aapke theme se match karega */
        }
        .react-calendar-heatmap .color-empty { 
          fill: #f1f5f9; 
        }
        .react-calendar-heatmap rect {
          rx: 2px; /* Rounded corners for boxes */
          ry: 2px;
        }
        /* Mobile Scrollbar fix */
        .heatmap-wrapper::-webkit-scrollbar {
          height: 4px;
        }
        .heatmap-wrapper::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
