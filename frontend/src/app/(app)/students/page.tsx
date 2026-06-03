"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { getStudents, deleteStudent } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PageSpinner } from "@/components/ui/spinner";
import type { Student } from "@/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetch = useCallback(() => {
    getStudents(search)
      .then(setStudents)
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete student "${name}"? This will also delete all their academic records.`)) return;
    try {
      await deleteStudent(id);
      toast.success("Student deleted");
      fetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or matric no..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setLoading(true); }}
            className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          />
        </div>
        <Link
          href="/students/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">
          {search ? "No students match your search." : "No students yet. Add your first student."}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                  <th className="px-4 py-3">Matric No</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Avg Score</th>
                  <th className="px-4 py-3">Prediction</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{s.matric_no}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {s.first_name} {s.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.department}</td>
                    <td className="px-4 py-3">{s.level}</td>
                    <td className="px-4 py-3">
                      <span className={s.average_score < 50 ? "text-red-600 font-semibold" : "text-gray-900"}>
                        {s.average_score}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.latest_prediction ? (
                        <Badge variant="grade" value={s.latest_prediction} />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/students/${s.id}`}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/students/${s.id}?edit=1`}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(s.id, `${s.first_name} ${s.last_name}`)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
