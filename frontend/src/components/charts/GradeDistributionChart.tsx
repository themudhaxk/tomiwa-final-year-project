"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const GRADE_COLORS: Record<string, string> = {
  A: "#22c55e",
  B: "#3b82f6",
  C: "#eab308",
  D: "#f97316",
  F: "#ef4444",
};

const GRADE_DESC: Record<string, string> = {
  A: "Excellent · 70%+",
  B: "Good · 60–69%",
  C: "Average · 50–59%",
  D: "Pass · 45–49%",
  F: "Fail · below 45%",
};

interface GradeDistributionChartProps {
  data: Record<string, number>;
}

export function GradeDistributionChart({ data }: GradeDistributionChartProps) {
  const chartData = useMemo(() => {
    const entries = Object.entries(data)
      .filter(([, count]) => count > 0)
      .map(([grade, count]) => ({
        grade,
        name: `Grade ${grade}`,
        value: count,
        color: GRADE_COLORS[grade] ?? "#94a3b8",
      }));
    return entries.sort((a, b) => b.value - a.value);
  }, [data]);

  const total = useMemo(() => chartData.reduce((sum, d) => sum + d.value, 0), [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </div>
        <p className="text-sm text-gray-400">No grade data available yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      {/* Donut */}
      <div className="relative h-[220px] w-[220px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(_value: number, _name: string, props: { payload?: { value: number; grade: string } }) => {
                const v = props.payload?.value ?? 0;
                const g = props.payload?.grade ?? "";
                const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0";
                return [`${v} record${v !== 1 ? "s" : ""} (${pct}%)`, `Grade ${g}`];
              }}
              contentStyle={{
                borderRadius: "0.625rem",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgb(0 0 0 / 0.06)",
                fontSize: "0.8125rem",
                padding: "8px 12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[1.625rem] font-bold leading-tight text-gray-900">{total}</span>
          <span className="text-[0.6875rem] text-gray-400">Records</span>
        </div>
      </div>

      {/* Legend — stacked vertically */}
      <div className="flex-1 space-y-2.5 w-full">
        {chartData.map((entry) => {
          const pct = ((entry.value / total) * 100).toFixed(1);
          return (
            <div key={entry.grade} className="group flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: entry.color }}>
                {entry.grade}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-800 truncate">{GRADE_DESC[entry.grade]}</span>
                  <span className="text-sm tabular-nums text-gray-500 shrink-0">{entry.value} <span className="text-gray-400">({pct}%)</span></span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: entry.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
