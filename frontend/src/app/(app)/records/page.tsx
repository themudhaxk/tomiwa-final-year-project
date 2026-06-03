"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Filter, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { getRecords, getStudents, getCourses, deleteRecord } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PageSpinner } from "@/components/ui/spinner";
import type { AcademicRecord, Student, Course } from "@/types";

export default function RecordsPage() {
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    student_id: "",
    course_id: "",
    semester: "",
    academic_year: "",
  });

  const fetch = useCallback(() => {
    const f: Record<string, string | number> = {};
    if (filters.student_id) f.student_id = Number(filters.student_id);
    if (filters.course_id) f.course_id = Number(filters.course_id);
    if (filters.semester) f.semester = filters.semester;
    if (filters.academic_year) f.academic_year = filters.academic_year;
    getRecords(f)
      .then(setRecords)
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    Promise.all([getRecords(), getStudents(), getCourses()])
      .then(([r, s, c]) => {
        setRecords(r);
        setStudents(s);
        setCourses(c);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch();
  }, [filters, fetch]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this record?")) return;
    try {
      await deleteRecord(id);
      toast.success("Record deleted");
      fetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filters.student_id}
            onChange={(e) => setFilters({ ...filters, student_id: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          >
            <option value="">All Students</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </select>
          <select
            value={filters.course_id}
            onChange={(e) => setFilters({ ...filters, course_id: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>
          <select
            value={filters.semester}
            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          >
            <option value="">All Semesters</option>
            <option value="first">First</option>
            <option value="second">Second</option>
          </select>
          <input
            placeholder="Academic Year (e.g. 2025/2026)"
            value={filters.academic_year}
            onChange={(e) => setFilters({ ...filters, academic_year: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none w-48"
          />
          <Filter className="h-4 w-4 text-gray-400" />
        </div>
        <Link
          href="/records/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" /> Add Record
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">No records found.</div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Att.</th>
                  <th className="px-4 py-3">Ass.</th>
                  <th className="px-4 py-3">CA</th>
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.student_name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.course_name}</td>
                    <td className="px-4 py-3">{r.attendance_score}%</td>
                    <td className="px-4 py-3">{r.assignment_score}%</td>
                    <td className="px-4 py-3">{r.ca_score}%</td>
                    <td className="px-4 py-3">{r.exam_score}%</td>
                    <td className="px-4 py-3 font-semibold">{r.total_score}%</td>
                    <td className="px-4 py-3"><Badge variant="grade" value={r.grade} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.semester}<br/>{r.academic_year}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(r.id)} className="rounded p-1.5 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
