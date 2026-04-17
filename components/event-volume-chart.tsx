"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

type EventVolumeChartProps = {
  data: Array<{ day: string; total: number }>;
};

export function EventVolumeChart({ data }: EventVolumeChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 12, right: 12, top: 16, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3fb950" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#3fb950" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fill: "#9ca6b5", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#9ca6b5", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", color: "#e6edf3" }}
          />
          <Area type="monotone" dataKey="total" stroke="#3fb950" strokeWidth={2} fill="url(#volumeGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
