"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { getReports } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PageSpinner } from "@/components/ui/spinner";
import { GradeDistributionChart } from "@/components/charts/GradeDistributionChart";
import { PerformanceTrendChart } from "@/components/charts/PerformanceTrendChart";
import type { ReportData } from "@/types";

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReports()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;
  if (!data) return <div className="text-red-500">Failed to load reports.</div>;

  const trendData = data.performance_trends.map((t) => ({
    label: `${t.semester} ${t.academic_year}`,
    average_score: t.average_score,
  }));

  // Compile grade distribution across all departments
  const overallGrades: Record<string, number> = {};
  for (const deptGrades of Object.values(data.grade_distribution_by_department)) {
    for (const [grade, count] of Object.entries(deptGrades)) {
      overallGrades[grade] = (overallGrades[grade] || 0) + count;
    }
  }

  return (
    <div className="space-y-6">
      {/* At-Risk Students */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="text-sm font-semibold text-red-900">At-Risk Students</h3>
          <span className="rounded-full bg-red-200 px-2 py-0.5 text-xs font-bold text-red-800">
            {data.at_risk_students.length}
          </span>
        </div>
        {data.at_risk_students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-red-700">
                  <th className="pb-2 pr-4">Matric No</th>
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Department</th>
                  <th className="pb-2">Average Score</th>
                </tr>
              </thead>
              <tbody>
                {data.at_risk_students.map((s) => (
                  <tr key={s.student_id} className="border-t border-red-200">
                    <td className="py-2 pr-4 font-mono text-xs">{s.matric_no}</td>
                    <td className="py-2 pr-4 font-medium text-gray-900">{s.name}</td>
                    <td className="py-2 pr-4 text-gray-600">{s.department}</td>
                    <td className="py-2 font-semibold text-red-600">{s.average_score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-red-700">No at-risk students detected. All students are performing above 50%.</p>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Overall Grade Distribution</h3>
          <GradeDistributionChart data={overallGrades} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Performance Trend by Semester</h3>
          <PerformanceTrendChart data={trendData} />
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Grade Distribution by Department</h3>
        {Object.keys(data.grade_distribution_by_department).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(data.grade_distribution_by_department).map(([dept, grades]) => (
              <div key={dept}>
                <h4 className="mb-2 text-xs font-medium text-gray-700">{dept}</h4>
                <div className="flex gap-2">
                  {Object.entries(grades).map(([grade, count]) => (
                    <div key={grade} className="flex items-center gap-1 rounded-lg border px-3 py-1 text-xs">
                      <Badge variant="grade" value={grade} />
                      <span className="font-semibold text-gray-700">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">No grade data available yet.</p>
        )}
      </div>

      {/* Model Metrics Summary */}
      {data.model_metrics && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900">Model Performance</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
            <div>
              <span className="text-gray-500">Accuracy</span>
              <p className="font-bold text-green-600">{(data.model_metrics.accuracy * 100).toFixed(1)}%</p>
            </div>
            <div>
              <span className="text-gray-500">Precision</span>
              <p className="font-bold text-blue-600">{(data.model_metrics.precision * 100).toFixed(1)}%</p>
            </div>
            <div>
              <span className="text-gray-500">Recall</span>
              <p className="font-bold text-purple-600">{(data.model_metrics.recall * 100).toFixed(1)}%</p>
            </div>
            <div>
              <span className="text-gray-500">F1 Score</span>
              <p className="font-bold text-orange-600">{(data.model_metrics.f1_score * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
