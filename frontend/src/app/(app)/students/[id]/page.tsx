"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Brain } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getStudent, updateStudent, getRecords, getPredictions, predictStudent } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PageSpinner, Spinner } from "@/components/ui/spinner";
import { PerformanceTrendChart } from "@/components/charts/PerformanceTrendChart";
import type { Student, AcademicRecord, Prediction } from "@/types";

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const studentId = Number(id);

  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string | number>>({});

  const fetchAll = useCallback(() => {
    Promise.all([
      getStudent(studentId),
      getRecords({ student_id: studentId }),
      getPredictions(studentId),
    ])
      .then(([s, r, p]) => {
        setStudent(s);
        setRecords(r);
        setPredictions(p);
        setEditForm({
          first_name: s.first_name,
          last_name: s.last_name,
          email: s.email,
          department: s.department,
          level: s.level,
          enrollment_year: s.enrollment_year,
        });
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const result = await predictStudent(studentId);
      toast.success(`Predicted grade: ${result.predicted_grade} (${(result.confidence * 100).toFixed(0)}% confidence)`);
      fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Prediction failed. Train the model first.");
    } finally {
      setPredicting(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updated = await updateStudent(studentId, editForm);
      setStudent(updated);
      setEditing(false);
      toast.success("Student updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  if (loading) return <PageSpinner />;
  if (!student) return <div className="text-red-500">Student not found.</div>;

  const trendData = records.map((r) => ({
    label: `${r.course_name} (${r.semester})`,
    average_score: r.total_score,
  }));

  return (
    <div className="space-y-6">
      <Link href="/students" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to students
      </Link>

      {/* Student Info Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {student.first_name} {student.last_name}
            </h3>
            <p className="mt-1 text-sm font-mono text-gray-500">{student.matric_no}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
              <span>{student.department}</span>
              <span>·</span>
              <span>{student.level} Level</span>
              <span>·</span>
              <span>Enrolled: {student.enrollment_year}</span>
              <span>·</span>
              <span>{student.email}</span>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <div>
                <span className="text-xs text-gray-500">Average Score</span>
                <p className={`text-lg font-bold ${student.average_score < 50 ? "text-red-600" : "text-gray-900"}`}>
                  {student.average_score}%
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Records</span>
                <p className="text-lg font-bold text-gray-900">{student.record_count}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Latest Prediction</span>
                <p className="text-lg font-bold">
                  {student.latest_prediction ? (
                    <Badge variant="grade" value={student.latest_prediction} />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePredict}
              disabled={predicting}
              className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {predicting ? <Spinner className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
              {predicting ? "Predicting..." : "Predict"}
            </button>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          </div>
        </div>

        {editing && (
          <div className="mt-6 border-t pt-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Edit Student</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="First name"
              />
              <input
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="Last name"
              />
              <input
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="Email"
              />
              <input
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="Department"
              />
              <input
                type="number"
                value={editForm.level}
                onChange={(e) => setEditForm({ ...editForm, level: Number(e.target.value) })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="Level"
              />
              <input
                type="number"
                value={editForm.enrollment_year}
                onChange={(e) => setEditForm({ ...editForm, enrollment_year: Number(e.target.value) })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="Enrollment year"
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Performance Chart and Records */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Performance Trend</h3>
          <PerformanceTrendChart data={trendData} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Prediction History</h3>
          {predictions.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {predictions.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <Badge variant="grade" value={p.predicted_grade} />
                    <span className="ml-2 text-xs text-gray-500">
                      {(p.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              No predictions yet. Click Predict to generate one.
            </div>
          )}
        </div>
      </div>

      {/* Academic Records Table */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Academic Records</h3>
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-gray-500">
                  <th className="pb-3 pr-4">Course</th>
                  <th className="pb-3 pr-4">Attendance</th>
                  <th className="pb-3 pr-4">Assignment</th>
                  <th className="pb-3 pr-4">CA</th>
                  <th className="pb-3 pr-4">Exam</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3 pr-4">Grade</th>
                  <th className="pb-3">Semester</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{r.course_name}</td>
                    <td className="py-3 pr-4">{r.attendance_score}%</td>
                    <td className="py-3 pr-4">{r.assignment_score}%</td>
                    <td className="py-3 pr-4">{r.ca_score}%</td>
                    <td className="py-3 pr-4">{r.exam_score}%</td>
                    <td className="py-3 pr-4 font-semibold">{r.total_score}%</td>
                    <td className="py-3 pr-4"><Badge variant="grade" value={r.grade} /></td>
                    <td className="py-3 text-gray-500">{r.semester} ({r.academic_year})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            No academic records for this student yet.
          </div>
        )}
      </div>
    </div>
  );
}
