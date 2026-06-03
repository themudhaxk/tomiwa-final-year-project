"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { getCourses, createCourse, updateCourse, deleteCourse } from "@/lib/api";
import { PageSpinner, Spinner } from "@/components/ui/spinner";
import type { Course, CourseCreate } from "@/types";

const DEPARTMENTS = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Statistics"];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CourseCreate>({
    code: "", name: "", department: "Computer Science", level: 100, credit_units: 3,
  });

  const fetch = () => { getCourses().then(setCourses).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const resetForm = () => {
    setForm({ code: "", name: "", department: "Computer Science", level: 100, credit_units: 3 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await updateCourse(editingId, form);
        toast.success("Course updated");
      } else {
        await createCourse(form);
        toast.success("Course added");
      }
      resetForm();
      fetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (course: Course) => {
    setForm({
      code: course.code,
      name: course.name,
      department: course.department,
      level: course.level,
      credit_units: course.credit_units,
    });
    setEditingId(course.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete course "${name}"?`)) return;
    try {
      await deleteCourse(id);
      toast.success("Course deleted");
      fetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" /> Add Course
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h4 className="mb-4 text-sm font-semibold text-gray-900">
            {editingId ? "Edit Course" : "Add New Course"}
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              placeholder="Course Code (e.g. CSC401)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            />
            <input
              placeholder="Course Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            />
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            >
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input
              type="number"
              placeholder="Level (100-500)"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            />
            <input
              type="number"
              placeholder="Credit Units"
              value={form.credit_units}
              onChange={(e) => setForm({ ...form, credit_units: Number(e.target.value) })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={resetForm} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !form.code || !form.name}
              className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving && <Spinner className="h-4 w-4" />}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">No courses yet.</div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{c.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.department}</td>
                  <td className="px-4 py-3">{c.level}</td>
                  <td className="px-4 py-3">{c.credit_units}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(c)} className="rounded p-1.5 text-gray-400 hover:text-blue-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="rounded p-1.5 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
