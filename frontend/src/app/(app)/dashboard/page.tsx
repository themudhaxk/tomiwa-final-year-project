"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, ClipboardList, AlertTriangle, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PageSpinner } from "@/components/ui/spinner";
import { GradeDistributionChart } from "@/components/charts/GradeDistributionChart";
import { PerformanceTrendChart } from "@/components/charts/PerformanceTrendChart";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;
  if (!stats) return <div className="text-red-500">Failed to load dashboard. Is the backend running?</div>;

  const cards = [
    { label: "Total Students", value: stats.total_students, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Total Courses", value: stats.total_courses, icon: BookOpen, color: "bg-purple-50 text-purple-600" },
    { label: "Academic Records", value: stats.total_records, icon: ClipboardList, color: "bg-green-50 text-green-600" },
    { label: "At-Risk Students", value: stats.at_risk_count, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Grade Distribution</h3>
          <GradeDistributionChart data={stats.grade_distribution} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Predictions Overview</h3>
          {stats.total_predictions > 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <TrendingUp className="h-12 w-12 text-primary-500" />
              <p className="text-lg font-semibold text-gray-900">{stats.total_predictions} Predictions Made</p>
              <p className="text-sm text-gray-500">Model trained and generating predictions</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <TrendingUp className="h-12 w-12 text-gray-300" />
              <p className="text-sm text-gray-500">No predictions yet. Train the model and run predictions.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Predictions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Recent Predictions</h3>
        {stats.recent_predictions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-gray-500">
                  <th className="pb-3 pr-4">Student</th>
                  <th className="pb-3 pr-4">Predicted Grade</th>
                  <th className="pb-3 pr-4">Confidence</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_predictions.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{p.student_name}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="grade" value={p.predicted_grade} />
                    </td>
                    <td className="py-3 pr-4">{(p.confidence * 100).toFixed(1)}%</td>
                    <td className="py-3 text-gray-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            No predictions yet. Go to Predictions to train the model.
          </div>
        )}
      </div>
    </div>
  );
}
