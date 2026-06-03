const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function token(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sapps_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  const t = token();
  if (t) {
    headers["Authorization"] = `Bearer ${t}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Auth ──

export async function login(email: string, password: string): Promise<{ token: string; user: import("@/types").User }> {
  const data = await request<{ token: string; user: import("@/types").User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("sapps_token", data.token);
  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: string,
): Promise<import("@/types").User> {
  const data = await request<import("@/types").User>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
  return data;
}

export function logout(): void {
  localStorage.removeItem("sapps_token");
}

export function getMe(): Promise<import("@/types").User> {
  return request<import("@/types").User>("/api/auth/me");
}

// ── Students ──

export function getStudents(search = "", department = ""): Promise<import("@/types").Student[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (department) params.set("department", department);
  return request<import("@/types").Student[]>(`/api/students?${params}`);
}

export function getStudent(id: number): Promise<import("@/types").Student> {
  return request<import("@/types").Student>(`/api/students/${id}`);
}

export function createStudent(data: import("@/types").StudentCreate): Promise<import("@/types").Student> {
  return request<import("@/types").Student>("/api/students", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateStudent(id: number, data: import("@/types").StudentUpdate): Promise<import("@/types").Student> {
  return request<import("@/types").Student>(`/api/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteStudent(id: number): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/students/${id}`, { method: "DELETE" });
}

// ── Courses ──

export function getCourses(department = ""): Promise<import("@/types").Course[]> {
  const params = department ? `?department=${encodeURIComponent(department)}` : "";
  return request<import("@/types").Course[]>(`/api/courses${params}`);
}

export function createCourse(data: import("@/types").CourseCreate): Promise<import("@/types").Course> {
  return request<import("@/types").Course>("/api/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCourse(id: number, data: Partial<import("@/types").CourseCreate>): Promise<import("@/types").Course> {
  return request<import("@/types").Course>(`/api/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCourse(id: number): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/courses/${id}`, { method: "DELETE" });
}

// ── Records ──

export function getRecords(filters?: {
  student_id?: number;
  course_id?: number;
  semester?: string;
  academic_year?: string;
}): Promise<import("@/types").AcademicRecord[]> {
  const params = new URLSearchParams();
  if (filters?.student_id) params.set("student_id", String(filters.student_id));
  if (filters?.course_id) params.set("course_id", String(filters.course_id));
  if (filters?.semester) params.set("semester", filters.semester);
  if (filters?.academic_year) params.set("academic_year", filters.academic_year);
  return request<import("@/types").AcademicRecord[]>(`/api/records?${params}`);
}

export function createRecord(data: import("@/types").AcademicRecordCreate): Promise<import("@/types").AcademicRecord> {
  return request<import("@/types").AcademicRecord>("/api/records", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getRecord(id: number): Promise<import("@/types").AcademicRecord> {
  return request<import("@/types").AcademicRecord>(`/api/records/${id}`);
}

export function updateRecord(
  id: number,
  data: Partial<import("@/types").AcademicRecordCreate>,
): Promise<import("@/types").AcademicRecord> {
  return request<import("@/types").AcademicRecord>(`/api/records/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRecord(id: number): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/records/${id}`, { method: "DELETE" });
}

// ── Predictions ──

export function getPredictions(student_id?: number): Promise<import("@/types").Prediction[]> {
  const params = student_id ? `?student_id=${student_id}` : "";
  return request<import("@/types").Prediction[]>(`/api/predictions${params}`);
}

export function trainModel(): Promise<{ success: boolean; metrics: import("@/types").ModelMetrics }> {
  return request<{ success: boolean; metrics: import("@/types").ModelMetrics }>("/api/predictions/train", {
    method: "POST",
  });
}

export function predictStudent(studentId: number): Promise<import("@/types").PredictionResult> {
  return request<import("@/types").PredictionResult>(`/api/predictions/predict/${studentId}`, {
    method: "POST",
  });
}

export function predictBatch(): Promise<{ predictions: import("@/types").PredictionResult[]; count: number }> {
  return request<{ predictions: import("@/types").PredictionResult[]; count: number }>("/api/predictions/predict-batch", {
    method: "POST",
  });
}

export function getModelMetrics(): Promise<import("@/types").ModelMetrics> {
  return request<import("@/types").ModelMetrics>("/api/predictions/model-metrics");
}

// ── Stats ──

export function getDashboardStats(): Promise<import("@/types").DashboardStats> {
  return request<import("@/types").DashboardStats>("/api/stats/dashboard");
}

export function getReports(): Promise<import("@/types").ReportData> {
  return request<import("@/types").ReportData>("/api/stats/reports");
}
