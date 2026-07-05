import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type AssessmentApi, type StudentApi, type StudentCreatePayload } from "./api";
import { useAuth } from "./auth";



export interface Student {
  id: string;
  name: string;
  regNo: string;
  email: string;
  mobileNumber?: string;
  department?: string;
  stream?: string;
  specialization?: string;
  pursuingYearLabel?: string;
  hackerRankUsername?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  leetcodeUrl?: string;
  startYear?: string;
  courseDuration?: string;
  graduationYear?: string;
  profilePicUrl?: string;
}

export interface AssessmentResource {
  id: string;
  name: string;
  contentType?: string;
  downloadUrl: string;
}

export interface Assessment {
  id: string;
  assessmentName: string;
  dateConducted: string; // ISO date
  totalMarks: number;
  createdBy?: string;
  resources?: AssessmentResource[];
}

/** key: `${studentId}:${assessmentId}` -> marks scored */
export type MarksMap = Record<string, number>;

export type Category = "Level 1" | "Level 2" | "Level 3" | "Uncategorized";

function categorize(averageMarks: number, attempts: number): Category {
  if (attempts === 0) return "Uncategorized";
  if (averageMarks >= 80) return "Level 1";
  if (averageMarks >= 50) return "Level 2";
  return "Level 3";
}

export interface StudentSummary extends Student {
  totalMarks: number;
  averageMarks: number; // average percentage across attempted assessments
  attempts: number;
  category: Category;
}

function toStudent(student: StudentApi): Student {
  let pursuingYearLabel = student.pursuingYearLabel ?? "";
  if (!pursuingYearLabel && student.startYear) {
    const startYear = parseInt(student.startYear.toString(), 10);
    if (!isNaN(startYear)) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const durationStr = student.courseDuration?.toString() ?? "4";
      const duration = parseInt(durationStr, 10);
      const gradYear = startYear + (isNaN(duration) ? 4 : duration);
      
      if (currentYear >= gradYear) {
        pursuingYearLabel = "Graduated";
      } else if (currentYear < startYear) {
        pursuingYearLabel = "Not Started";
      } else {
        const diff = currentYear - startYear;
        let year = diff + (currentMonth >= 6 ? 1 : 0);
        if (year <= 0) year = 1;
        if (year === 1) pursuingYearLabel = "1st Year";
        else if (year === 2) pursuingYearLabel = "2nd Year";
        else if (year === 3) pursuingYearLabel = "3rd Year";
        else pursuingYearLabel = `${year}th Year`;
      }
    }
  }

  return {
    id: String(student.id),
    name: student.name,
    regNo: student.regNo,
    email: student.email,
    mobileNumber: student.mobileNumber ?? "",
    department: student.department ?? "",
    stream: student.stream ?? "",
    specialization: student.specialization ?? "",
    pursuingYearLabel: pursuingYearLabel,
    hackerRankUsername: student.hackerRankUsername ?? "",
    linkedInUrl: student.linkedInUrl ?? "",
    githubUrl: student.githubUrl ?? "",
    leetcodeUrl: student.leetcodeUrl ?? "",
    startYear: student.startYear?.toString() ?? "",
    courseDuration: student.courseDuration?.toString() ?? "",
    graduationYear: student.graduationYear?.toString() ?? "",
    profilePicUrl: student.profilePicUrl ?? "",
  };
}

function toAssessment(assessment: AssessmentApi): Assessment {
  return {
    id: String(assessment.id),
    assessmentName: assessment.assessmentName,
    dateConducted: assessment.dateConducted,
    totalMarks: assessment.totalMarks,
    createdBy: assessment.createdBy,
    resources: assessment.resources?.map((resource) => ({
      id: String(resource.id),
      name: resource.name,
      contentType: resource.contentType,
      downloadUrl: resource.downloadUrl,
    })) ?? [],
  };
}

function toStudentCreatePayload(student: Omit<Student, "id">): StudentCreatePayload {
  return {
    name: student.name,
    regNo: student.regNo,
    email: student.email,
    mobileNumber: student.mobileNumber || undefined,
    department: student.department || undefined,
    stream: student.stream || undefined,
    specialization: student.specialization || undefined,
    hackerRankUsername: student.hackerRankUsername || undefined,
    startYear: student.startYear ? Number(student.startYear) : undefined,
    courseDuration: student.courseDuration ? Number(student.courseDuration) : undefined,
    linkedInUrl: student.linkedInUrl || undefined,
    githubUrl: student.githubUrl || undefined,
    leetcodeUrl: student.leetcodeUrl || undefined,
  };
}

interface SMSContextValue {
  students: Student[];
  assessments: Assessment[];
  marks: MarksMap;
  summaries: StudentSummary[];
  getStudent: (id: string) => Student | undefined;
  getSummary: (id: string) => StudentSummary | undefined;
  getAssessment: (id: string) => Assessment | undefined;
  addStudent: (s: Omit<Student, "id">, file?: File) => Promise<Student>;
  addStudentsBulk: (rows: Omit<Student, "id">[]) => Promise<{ added: number; updated: number }>;
  updateStudent: (id: string, s: Omit<Student, "id">, file?: File) => Promise<Student>;
  removeStudentPhoto: (id: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  deleteStudentsBulk: (ids: number[]) => Promise<void>;
  deleteAllStudents: () => Promise<void>;
  addAssessment: (a: Omit<Assessment, "id">, files?: File[]) => Promise<Assessment>;
  updateAssessment: (id: string, a: Omit<Assessment, "id">, files?: File[]) => Promise<Assessment>;
  deleteAssessment: (id: string) => Promise<void>;
  deleteAssessmentsBulk: (ids: number[]) => Promise<void>;
  deleteAllAssessments: () => Promise<void>;
  setMark: (studentId: string, assessmentId: string, marks: number | null) => Promise<void>;
  setMarksByRegNo: (
    assessmentId: string,
    rows: { regNo: string; marks: number }[],
  ) => Promise<{ matched: number; unmatched: string[] }>;
  isLoading: boolean;
  isError: boolean;
}

const SMSContext = createContext<SMSContextValue | null>(null);

export function SMSProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { isStudent } = useAuth();

  const studentsQuery = useQuery({ queryKey: ["students"], queryFn: api.getStudents });
  const assessmentsQuery = useQuery({ queryKey: ["assessments"], queryFn: api.getAssessments });
  const marksQuery = useQuery({ queryKey: ["marks"], queryFn: api.getAllMarks });

  const isLoading = studentsQuery.isLoading || assessmentsQuery.isLoading || marksQuery.isLoading;
  const isError = studentsQuery.isError || assessmentsQuery.isError || marksQuery.isError;

  const students = useMemo(() => {
    return studentsQuery.data?.map(toStudent) ?? [];
  }, [studentsQuery.data]);

  const assessments = useMemo(() => {
    return assessmentsQuery.data?.map(toAssessment) ?? [];
  }, [assessmentsQuery.data]);

  const marks = useMemo(() => {
    const next: MarksMap = {};
    for (const mark of marksQuery.data ?? []) {
      if (!mark.student || !mark.assessment) continue;
      next[`${mark.student.id}:${mark.assessment.id}`] = mark.marksScored;
    }
    return next;
  }, [marksQuery.data]);

  const summaries = useMemo<StudentSummary[]>(() => {
    return students.map((student) => {
      let total = 0;
      let pctSum = 0;
      let attempts = 0;
      for (const a of assessments) {
        const key = `${student.id}:${a.id}`;
        if (marks[key] !== undefined) {
          const scored = marks[key];
          total += scored;
          pctSum += a.totalMarks > 0 ? (scored / a.totalMarks) * 100 : 0;
          attempts += 1;
        }
      }
      const averageMarks = attempts > 0 ? pctSum / attempts : 0;
      return {
        ...student,
        totalMarks: total,
        averageMarks,
        attempts,
        category: categorize(averageMarks, attempts),
      };
    });
  }, [students, assessments, marks]);

  const value: SMSContextValue = {
    students,
    assessments,
    marks,
    summaries,
    getStudent: (id) => students.find((s) => s.id === id),
    getSummary: (id) => summaries.find((s) => s.id === id),
    getAssessment: (id) => assessments.find((a) => a.id === id),
    isLoading,
    isError,
    addStudent: async (s, file) => {
      const created = await api.createStudent(toStudentCreatePayload(s), file);
      await queryClient.invalidateQueries({ queryKey: [] });
      return toStudent(created);
    },
    addStudentsBulk: async (rows) => {
      let added = 0;
      let updated = 0;
      for (const row of rows) {
        try {
          await api.createStudent(toStudentCreatePayload(row));
          added += 1;
        } catch {
          updated += 1;
        }
      }
      await queryClient.invalidateQueries({ queryKey: [] });
      return { added, updated };
    },
    updateStudent: async (id, s, file) => {
      const updated = await api.updateStudent(id, toStudentCreatePayload(s), file);
      await queryClient.invalidateQueries({ queryKey: [] });
      return toStudent(updated);
    },
    removeStudentPhoto: async (id) => {
      await api.deleteStudentPhoto(id);
      await queryClient.invalidateQueries({ queryKey: [] });
    },
    deleteStudent: async (id) => {
      await api.deleteStudent(id);
      await queryClient.invalidateQueries({ queryKey: [] });
    },
    deleteStudentsBulk: async (ids) => {
      await api.deleteStudentsBulk(ids);
      await queryClient.invalidateQueries({ queryKey: [] });
    },
    deleteAllStudents: async () => {
      await api.deleteAllStudents();
      await queryClient.invalidateQueries({ queryKey: [] });
    },
    addAssessment: async (a, files) => {
      const created = await api.createAssessment(
        {
          assessmentName: a.assessmentName,
          dateConducted: a.dateConducted,
          totalMarks: a.totalMarks,
        },
        files,
      );
      await queryClient.invalidateQueries({ queryKey: [] });
      return toAssessment(created);
    },
    updateAssessment: async (id, a, files) => {
      const updated = await api.updateAssessment(
        id,
        {
          assessmentName: a.assessmentName,
          dateConducted: a.dateConducted,
          totalMarks: a.totalMarks,
        },
        files,
      );
      await queryClient.invalidateQueries({ queryKey: [] });
      return toAssessment(updated);
    },
    deleteAssessment: async (id) => {
      await api.deleteAssessment(id);
      await queryClient.invalidateQueries({ queryKey: [] });
    },
    deleteAssessmentsBulk: async (ids) => {
      await api.deleteAssessmentsBulk(ids);
      await queryClient.invalidateQueries({ queryKey: [] });
    },
    deleteAllAssessments: async () => {
      await api.deleteAllAssessments();
      await queryClient.invalidateQueries({ queryKey: [] });
    },
    setMark: async (studentId, assessmentId, m) => {
      if (m === null || Number.isNaN(m)) {
        await api.deleteMark(studentId, assessmentId);
      } else {
        await api.assignMark(studentId, assessmentId, m);
      }
      await queryClient.invalidateQueries({ queryKey: [] });
    },
    setMarksByRegNo: async (assessmentId, rows) => {
      const unmatched: string[] = [];
      let matched = 0;
      for (const row of rows) {
        const student = students.find(
          (s) => s.regNo.trim().toLowerCase() === row.regNo.trim().toLowerCase(),
        );
        if (!student) {
          unmatched.push(row.regNo);
          continue;
        }
        await api.assignMark(student.id, assessmentId, row.marks);
        matched += 1;
      }
      await queryClient.invalidateQueries({ queryKey: [] });
      return { matched, unmatched };
    },
  };

  return <SMSContext.Provider value={value}>{children}</SMSContext.Provider>;
}

export function useSMS() {
  const ctx = useContext(SMSContext);
  if (!ctx) throw new Error("useSMS must be used within SMSProvider");
  return ctx;
}
