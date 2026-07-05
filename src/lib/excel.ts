import * as XLSX from "xlsx";
import type { Student } from "./sms-data";

export type StudentRow = Omit<Student, "id">;

function str(v: unknown): string {
  return v === undefined || v === null ? "" : String(v).trim();
}

/** Read first worksheet of an uploaded file into row objects keyed by header. */
async function readRows(file: File): Promise<Record<string, unknown>[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
}

/** Match a header by case-insensitive partial keys. */
function pick(row: Record<string, unknown>, keys: string[]): unknown {
  const lowered: Record<string, unknown> = {};
  for (const k of Object.keys(row)) lowered[k.trim().toLowerCase()] = row[k];
  for (const key of keys) {
    if (key in lowered && str(lowered[key]) !== "") return lowered[key];
  }
  return "";
}

export async function parseStudents(file: File): Promise<StudentRow[]> {
  const rows = await readRows(file);
  const out: StudentRow[] = [];
  for (const row of rows) {
    const name = str(pick(row, ["name", "full name", "student name"]));
    const regNo = str(pick(row, ["regno", "reg no", "registration number", "register number"]));
    if (!name && !regNo) continue;
    
    const email = str(pick(row, ["email", "email address"]));
    const stream = str(pick(row, ["stream", "department", "dept"]));
    const specialization = str(pick(row, ["specialization", "spec", "branch"]));
    out.push({
      name,
      regNo,
      email,
      mobileNumber: str(pick(row, ["mobilenumber", "mobile number", "mobile", "phone"])),
      stream,
      specialization,
      hackerRankUsername: str(pick(row, ["hackerrankusername", "hackerrank username", "hackerrank"])),
      linkedInUrl: str(pick(row, ["linkedinurl", "linkedin url", "linkedin"])),
      githubUrl: str(pick(row, ["githuburl", "github url", "github"])),
      leetcodeUrl: str(pick(row, ["leetcodeurl", "leetcode url", "leetcode"])),
      startYear: str(pick(row, ["startyear", "start year"])),
      courseDuration: str(pick(row, ["courseduration", "course duration", "duration"])),
    });
  }
  return out;
}

export interface MarkRow {
  regNo: string;
  marks: number;
}

export async function parseMarks(file: File): Promise<MarkRow[]> {
  const rows = await readRows(file);
  const out: MarkRow[] = [];
  for (const row of rows) {
    const regNo = str(pick(row, ["regno", "reg no", "registration number", "register number"]));
    const marksRaw = pick(row, ["marks", "mark", "score", "marks scored", "marks obtained"]);
    if (!regNo) continue;
    const marks = Number(marksRaw);
    if (Number.isNaN(marks)) continue;
    out.push({ regNo, marks });
  }
  return out;
}

export function downloadStudentTemplate() {
  const headers = [
    "name",
    "regNo",
    "email",
    "mobileNumber",
    "stream",
    "specialization",
    "hackerRankUsername",
    "linkedInUrl",
    "githubUrl",
    "leetcodeUrl",
    "startYear",
    "courseDuration",
  ];
  const sample = [
    {
      name: "Jane Doe",
      regNo: "21CSE100",
      email: "jane.doe@college.edu",
      mobileNumber: "9876500000",
      stream: "BE",
      specialization: "CSE",
      hackerRankUsername: "jane_d",
      linkedInUrl: "https://linkedin.com/in/janedoe",
      githubUrl: "https://github.com/janedoe",
      leetcodeUrl: "https://leetcode.com/janedoe",
      startYear: "2021",
      courseDuration: "4",
    },
  ];
  const ws = XLSX.utils.json_to_sheet(sample, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  XLSX.writeFile(wb, "student-template.xlsx");
}

export function downloadMarksTemplate(totalMarks = 100) {
  const sample = [
    { regNo: "21CSE001", marks: Math.round(totalMarks * 0.9) },
    { regNo: "21IT014", marks: Math.round(totalMarks * 0.6) },
  ];
  const ws = XLSX.utils.json_to_sheet(sample, { header: ["regNo", "marks"] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Marks");
  XLSX.writeFile(wb, "marks-template.xlsx");
}

/** Read an uploaded resource file into a base64 data URL. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
