export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

function buildUrl(path: string) {
  return `${API_BASE}${path}`;
}

function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem("eduTrack_user");
  return stored ? JSON.parse(stored).token : null;
}

function buildAuthHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = buildAuthHeaders(init);

  const res = await fetch(buildUrl(path), {
    credentials: "include",
    ...init,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed: ${res.status} ${res.statusText} ${text}`);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as unknown as T;
  }

  return (await res.json()) as T;
}

export interface UserDto {
  userId: number;
  username: string;
  role: string;
  enabled: boolean;
  fullName: string;
  regNo: string;
  stream: string;
  department: string;
  specialization: string;
  pursuingYearLabel?: string | null;
  hackerRankUsername?: string;
  startYear?: number | null;
  courseDuration?: number | null;
  graduationYear?: number | null;
  linkedInUrl?: string;
}

export type StudentApi = {
  id: number;
  name: string;
  regNo: string;
  email: string;
  mobileNumber?: string;
  department?: string;
  stream?: string;
  specialization?: string;
  pursuingYearLabel?: string | null;
  hackerRankUsername?: string;
  startYear?: number | null;
  courseDuration?: number | null;
  graduationYear?: number | null;
  linkedInUrl?: string;
  githubUrl?: string;
  leetcodeUrl?: string;
  profilePicUrl?: string;
};

export type AssessmentResourceApi = {
  id: number;
  name: string;
  contentType: string;
  downloadUrl: string;
};

export type AssessmentApi = {
  id: number;
  assessmentName: string;
  dateConducted: string;
  totalMarks: number;
  createdBy?: string;
  resources?: AssessmentResourceApi[];
};

export type StudentAssessmentMarkApi = {
  id: number;
  marksScored: number;
  student: { id: number };
  assessment: { id: number; totalMarks: number };
};

export type StudentCreatePayload = Omit<
  StudentApi,
  "id" | "profilePicUrl" | "pursuingYearLabel" | "startYear" | "courseDuration" | "graduationYear"
> & {
  startYear?: number | null;
  courseDuration?: number | null;
};

export type AssessmentCreatePayload = Omit<AssessmentApi, "id" | "resources">;

export type DesignationApi = {
  id: number;
  name: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type StaffProfileApi = {
  id: number;
  name: string;
  email: string;
  mobileNumber?: string;
  linkedInUrl?: string;
  department?: string;
  stream?: string;
  specialization?: string;
  profilePhotoUrl?: string;
  designation?: DesignationApi;
  user?: { id: number; username: string; role: string; enabled: boolean };
  username?: string;
  employeeId?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  qualification?: string;
  experience?: number;
  joiningDate?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StaffProfileUpdatePayload = Omit<
  StaffProfileApi,
  "id" | "profilePhotoUrl" | "user" | "createdAt" | "updatedAt"
> & {
  designation?: DesignationApi;
};


function buildStudentFormData(
  payload: StudentCreatePayload,
  file?: File,
): FormData {
  const form = new FormData();
  form.set("student", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  if (file) {
    form.set("file", file);
  }
  return form;
}

export const api = {
  getStudents: () => request<StudentApi[]>("/api/students"),
  getMyStudentProfile: () => request<StudentApi>("/api/students/me"),
  getStudentDetails: (id: string | number) => request<StudentApi>(`/api/students/${id}/details`),
  createStudent: (payload: StudentCreatePayload, file?: File) =>
    request<StudentApi>("/api/students", {
      method: "POST",
      body: buildStudentFormData(payload, file),
    }),
  updateStudent: (id: string | number, payload: StudentCreatePayload, file?: File) =>
    request<StudentApi>(`/api/students/${id}`, {
      method: "PUT",
      body: buildStudentFormData(payload, file),
    }),
  deleteStudentPhoto: (id: string | number) =>
    request<void>(`/api/students/${id}/photo`, {
      method: "DELETE",
    }),
  deleteStudent: (id: string | number) =>
    request<void>(`/api/students/${id}`, { method: "DELETE" }),
  deleteStudentsBulk: (ids: number[]) =>
    request<void>("/api/students/bulk", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids),
    }),
  deleteAllStudents: () =>
    request<void>("/api/students/all", { method: "DELETE" }),
  uploadStudentsExcel: (file: File) => {
    const form = new FormData();
    form.set("file", file);
    return request<Record<string, unknown>>("/api/students/upload", {
      method: "POST",
      body: form,
    });
  },

  getAssessments: () => request<AssessmentApi[]>("/api/assessments"),
  createAssessment: (payload: AssessmentCreatePayload, files?: File[]) => {
    const form = new FormData();
    form.set("assessment", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    files?.forEach((file) => form.append("resources", file));
    return request<AssessmentApi>("/api/assessments", {
      method: "POST",
      body: form,
    });
  },
  updateAssessment: (id: string | number, payload: AssessmentCreatePayload, files?: File[]) => {
    const form = new FormData();
    form.set("assessment", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    files?.forEach((file) => form.append("resources", file));
    return request<AssessmentApi>(`/api/assessments/${id}`, {
      method: "PUT",
      body: form,
    });
  },
  deleteAssessment: (id: string | number) =>
    request<void>(`/api/assessments/${id}`, { method: "DELETE" }),
  deleteAssessmentsBulk: (ids: number[]) =>
    request<void>("/api/assessments/bulk", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids),
    }),
  deleteAllAssessments: () =>
    request<void>("/api/assessments/all", { method: "DELETE" }),

  getAllMarks: () => request<StudentAssessmentMarkApi[]>("/api/marks"),
  getMarksForAssessment: (assessmentId: string | number) =>
    request<StudentAssessmentMarkApi[]>(`/api/marks/assessment/${assessmentId}`),
  assignMark: (studentId: string | number, assessmentId: string | number, marks: number) =>
    request<StudentAssessmentMarkApi>(
      `/api/marks?studentId=${studentId}&assessmentId=${assessmentId}&marks=${marks}`,
      { method: "POST" },
    ),
  deleteMark: (studentId: string | number, assessmentId: string | number) =>
    request<void>(
      `/api/marks?studentId=${studentId}&assessmentId=${assessmentId}`,
      { method: "DELETE" },
    ),
  uploadMarksExcel: (file: File, assessmentId: string | number) => {
    const form = new FormData();
    form.set("file", file);
    form.set("assessmentId", String(assessmentId));
    return request<Record<string, unknown>>("/api/marks/upload", {
      method: "POST",
      body: form,
    });
  },

  getCurrentStaffProfile: () => request<StaffProfileApi>("/api/staff/me"),
  updateCurrentStaffProfile: (payload: StaffProfileUpdatePayload) =>
    request<StaffProfileApi>("/api/staff/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  uploadStaffPhoto: (file: File) => {
    const form = new FormData();
    form.set("file", file);
    return request<StaffProfileApi>("/api/staff/me/photo", {
      method: "POST",
      body: form,
    });
  },
  deleteStaffPhoto: () =>
    request<StaffProfileApi>("/api/staff/me/photo", {
      method: "DELETE",
    }),
  changePassword: (payload: ChangePasswordPayload) =>
    request<void>("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  getAllStaff: () => request<StaffProfileApi[]>("/api/staff"),
  getStaffById: (id: string | number) =>
    request<StaffProfileApi>(`/api/staff/${id}`),
  updateStaff: (id: string | number, payload: StaffProfileUpdatePayload) =>
    request<StaffProfileApi>(`/api/staff/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  deleteStaff: (id: string | number) =>
    request<void>(`/api/staff/${id}`, { method: "DELETE" }),
  getDesignations: () => request<DesignationApi[]>("/api/staff/designations"),
};

export function getReportDownloadUrl(format: "excel" | "pdf", filter: string) {
  return `${API_BASE}/api/dashboard/export?format=${format}&filter=${encodeURIComponent(filter)}`;
}

export async function downloadReport(format: "excel" | "pdf", filter: string) {
  const url = getReportDownloadUrl(format, filter);
  const headers = buildAuthHeaders();
  const res = await fetch(url, {
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Report download failed: ${res.status} ${res.statusText} ${text}`);
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get("content-disposition") ?? "";
  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  const filename = filenameMatch?.[1] ?? `${format === "pdf" ? "dashboard_report" : "dashboard_report"}.${format === "pdf" ? "pdf" : "xlsx"}`;
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}
