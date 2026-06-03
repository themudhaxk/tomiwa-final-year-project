"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendData {
  label: string;
  average_score: number;
}

interface PerformanceTrendChartProps {
  data: TrendData[];
  title?: string;
}

export function PerformanceTrendChart({ data, title }: PerformanceTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        No trend data available. Add more academic records across semesters.
      </div>
    );
  }

  return (
    <div className="h-72">
      {title && <h4 className="mb-3 text-sm font-medium text-gray-700">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => [`${value}%`, "Average Score"]}
          />
          <Bar dataKey="average_score" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
