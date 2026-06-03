"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getRecord } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PageSpinner } from "@/components/ui/spinner";
import type { AcademicRecord } from "@/types";

export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<AcademicRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecord(Number(id))
      .then(setRecord)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!record) return <div className="text-red-500">Record not found.</div>;

  const scoreItems = [
    { label: "Attendance (10%)", value: record.attendance_score },
    { label: "Assignment (10%)", value: record.assignment_score },
    { label: "C.A. (10%)", value: record.ca_score },
    { label: "Exam (70%)", value: record.exam_score },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <Link href="/records" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to records
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{record.course_name}</h3>
            <p className="text-sm text-gray-500">{record.student_name}</p>
          </div>
          <Badge variant="grade" value={record.grade} />
        </div>

        <div className="space-y-3">
          {scoreItems.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-semibold text-gray-900">{item.value}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.value >= 70 ? "bg-green-500" : item.value >= 50 ? "bg-blue-500" : "bg-red-500"
                  }`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Score</span>
            <span className="text-xl font-bold text-gray-900">{record.total_score}%</span>
          </div>
          <div className="mt-3 flex gap-4 text-sm text-gray-500">
            <span>Semester: <strong className="text-gray-700 capitalize">{record.semester}</strong></span>
            <span>Year: <strong className="text-gray-700">{record.academic_year}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
