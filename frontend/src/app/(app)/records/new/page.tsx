"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getStudents, getCourses, createRecord } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import type { Student, Course } from "@/types";

export default function NewRecordPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    student_id: 0,
    course_id: 0,
    attendance_score: 0,
    assignment_score: 0,
    ca_score: 0,
    exam_score: 0,
    semester: "first",
    academic_year: "2025/2026",
  });

  useEffect(() => {
    Promise.all([getStudents(), getCourses()]).then(([s, c]) => {
      setStudents(s);
      setCourses(c);
      if (s.length > 0) setForm((f) => ({ ...f, student_id: s[0].id }));
      if (c.length > 0) setForm((f) => ({ ...f, course_id: c[0].id }));
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.student_id || !form.course_id) {
      toast.error("Please select a student and course");
      return;
    }
    setLoading(true);
    try {
      await createRecord(form);
      toast.success("Academic record added");
      router.push("/records");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add record");
    } finally {
      setLoading(false);
    }
  };

  if (students.length === 0 || courses.length === 0) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm text-gray-500">
          You need to add students and courses before adding academic records.
        </p>
        <div className="mt-3 flex gap-3">
          <Link href="/students/new" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Add Student →
          </Link>
          <Link href="/courses" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Add Course →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link href="/records" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to records
      </Link>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-6 text-base font-semibold text-gray-900">Add Academic Record</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Student</label>
              <select
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: Number(e.target.value) })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                required
              >
                <option value={0}>Select student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} ({s.matric_no})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Course</label>
              <select
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: Number(e.target.value) })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                required
              >
                <option value={0}>Select course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Scores (0-100%)</label>
            <p className="mb-2 text-xs text-gray-400">Weighting: Attendance 10% + Assignment 10% + CA 10% + Exam 70%</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Attendance</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.attendance_score}
                  onChange={(e) => setForm({ ...form, attendance_score: Number(e.target.value) })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Assignment</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.assignment_score}
                  onChange={(e) => setForm({ ...form, assignment_score: Number(e.target.value) })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">C.A.</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.ca_score}
                  onChange={(e) => setForm({ ...form, ca_score: Number(e.target.value) })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Exam</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.exam_score}
                  onChange={(e) => setForm({ ...form, exam_score: Number(e.target.value) })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Semester</label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              >
                <option value="first">First Semester</option>
                <option value="second">Second Semester</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Academic Year</label>
              <input
                value={form.academic_year}
                onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="2025/2026"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/records" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition"
            >
              {loading && <Spinner className="h-4 w-4" />}
              {loading ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
