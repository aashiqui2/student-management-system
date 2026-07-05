import { createFileRoute, useParams, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Github,
  Linkedin,
  Code2,
  Pencil,
} from "lucide-react";
import { useSMS } from "@/lib/sms-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_BASE, api } from "@/lib/api";
import { CategoryBadge } from "@/components/sms/CategoryBadge";
import { EmptyState } from "@/components/sms/EmptyState";

export const Route = createFileRoute("/students/$id")({
  head: () => ({
    meta: [{ title: "Student Profile — EduTrack" }],
  }),
  component: StudentProfile,
});

function StudentProfile() {
  const { id } = useParams({ from: "/students/$id" });
  const navigate = useNavigate();
  const { getSummary, assessments, marks } = useSMS();
  const { isAdmin, isStudent, user } = useAuth();
  const student = getSummary(id);

  const myProfileQuery = useQuery({
    queryKey: ["myStudentProfile"],
    queryFn: api.getMyStudentProfile,
    enabled: isStudent,
  });

  const myStudentId = myProfileQuery.data?.id?.toString();
  const canEdit = isAdmin || (isStudent && myStudentId === id);

  if (!student) {
    return (
      <EmptyState
        message="Student not found."
        actionLabel="Back to Students"
        onAction={() => navigate({ to: "/students" })}
      />
    );
  }

  const history = assessments
    .filter((a) => `${id}:${a.id}` in marks)
    .map((a) => {
      const scored = marks[`${id}:${a.id}`];
      return {
        name: a.assessmentName,
        date: a.dateConducted,
        scored,
        total: a.totalMarks,
        pct: a.totalMarks > 0 ? (scored / a.totalMarks) * 100 : 0,
      };
    });

  const chartData = history.map((h) => ({
    name: h.name.length > 12 ? `${h.name.slice(0, 12)}…` : h.name,
    percentage: Number(h.pct.toFixed(1)),
  }));

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate({ to: "/students" })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
        {canEdit && (
          <Link to="/students/edit/$id" params={{ id }} className="ml-auto">
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="h-24 w-24">
              {student.profilePicUrl && (
                <AvatarImage src={`${API_BASE}/api/students/${student.id}/photo`} alt={student.name} />
              )}
              <AvatarFallback className="bg-accent text-2xl text-primary">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-bold">{student.name}</h2>
            <p className="font-mono text-xs text-muted-foreground">{student.regNo}</p>
            <div className="mt-3">
              <CategoryBadge category={student.category} />
            </div>

            <div className="mt-6 grid w-full grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-2xl font-bold text-primary">{student.attempts}</p>
                <p className="text-xs text-muted-foreground">Assessments</p>
              </div>
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-2xl font-bold text-primary">
                  {student.averageMarks.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>
            </div>

            <div className="mt-6 w-full space-y-3 text-left text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4" /> <span>{student.email}</span>
              </div>
              {student.mobileNumber && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4" /> <span>{student.mobileNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-muted-foreground">
                <Building2 className="h-4 w-4" />{" "}
                <span>
                  {student.department ? `${student.department} - ` : ""}
                  {student.stream || "N/A"} - {student.specialization || "N/A"}
                </span>
              </div>
              {student.pursuingYear && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="text-xs font-medium">Year:</span>
                  <span>{student.pursuingYear.replace("_", " ").toLowerCase()}</span>
                </div>
              )}
              {student.githubUrl && (
                <a
                  href={student.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-primary hover:underline"
                >
                  <Github className="h-4 w-4" /> <span>GitHub</span>
                </a>
              )}
              {student.linkedInUrl && (
                <a
                  href={student.linkedInUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-primary hover:underline"
                >
                  <Linkedin className="h-4 w-4" /> <span>LinkedIn</span>
                </a>
              )}
              {student.leetcodeUrl && (
                <a
                  href={student.leetcodeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-primary hover:underline"
                >
                  <Code2 className="h-4 w-4" /> <span>LeetCode</span>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 text-lg font-semibold">Performance Trend</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0.01 255)" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis domain={[0, 100]} fontSize={12} />
                    <RTooltip />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="oklch(0.58 0.21 256)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No assessment data recorded yet." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 text-lg font-semibold">Assessment History</h3>
              {history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 font-semibold">Assessment</th>
                        <th className="py-2 font-semibold">Date</th>
                        <th className="py-2 font-semibold">Score</th>
                        <th className="py-2 text-right font-semibold">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h.name} className="border-b last:border-0">
                          <td className="py-3 font-medium">{h.name}</td>
                          <td className="py-3 text-muted-foreground">
                            {new Date(h.date).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            {h.scored} / {h.total}
                          </td>
                          <td className="py-3 text-right">
                            <Badge variant="secondary">{h.pct.toFixed(0)}%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState message="No assessment history." />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
