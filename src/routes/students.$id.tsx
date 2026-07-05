import { createFileRoute, useParams, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
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
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const { isAdmin, isStudent, isStaff, user } = useAuth();
  const student = getSummary(id);

  const myProfileQuery = useQuery({
    queryKey: ["myStudentProfile"],
    queryFn: api.getMyStudentProfile,
    enabled: isStudent,
  });

  const myStudentId = myProfileQuery.data?.id?.toString();
  const canEdit = isAdmin || isStaff || (isStudent && myStudentId === id);

  // Change Password Form State
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRequirements = [
    { met: passwordData.newPassword.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(passwordData.newPassword), text: "One uppercase letter" },
    { met: /[a-z]/.test(passwordData.newPassword), text: "One lowercase letter" },
    { met: /[0-9]/.test(passwordData.newPassword), text: "One number" },
    { met: /[^A-Za-z0-9]/.test(passwordData.newPassword), text: "One special character" },
  ];

  const strength = passwordRequirements.filter(r => r.met).length;
  const strengthColor = strength <= 2 ? "bg-red-500" : strength <= 4 ? "bg-amber-500" : "bg-emerald-500";
  const strengthBgColor = strength <= 2 ? "bg-red-500/10" : strength <= 4 ? "bg-amber-500/10" : "bg-emerald-500/10";
  const strengthLabel = strength <= 2 ? "Weak" : strength <= 4 ? "Medium" : "Strong";

  const changePasswordMutation = useMutation({
    mutationFn: api.changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
      setIsPasswordDialogOpen(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      const msg = error.response?.data || error.message;
      toast.error(msg || "Failed to change password. Make sure current password is correct.");
    }
  });

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (strength < 5) {
      toast.error("Please meet all password requirements");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

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
        <div className="ml-auto flex items-center gap-3">
          {canEdit && (
            <Link to="/students/edit/$id" params={{ id }}>
              <Button variant="outline">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
          {isStudent && myStudentId === id && (
            <Button
              onClick={() => setIsPasswordDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Lock className="w-4 h-4 mr-2" /> Change Password
            </Button>
          )}
        </div>
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
                  {student.stream || "N/A"} - {student.specialization || "N/A"}
                </span>
              </div>
              {student.startYear && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="text-xs font-medium">Batch:</span>
                  <span>{student.startYear} - {student.graduationYear || (student.courseDuration ? Number(student.startYear) + Number(student.courseDuration) : '?')}</span>
                </div>
              )}
              {student.pursuingYearLabel && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="text-xs font-medium">Status:</span>
                  <span>{student.pursuingYearLabel}</span>
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

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePasswordSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="currPass">Current Password</Label>
              <div className="relative">
                <Input
                  id="currPass"
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPass">New Password</Label>
              <div className="relative">
                <Input
                  id="newPass"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {passwordData.newPassword && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthColor}`}
                        style={{ width: `${(strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${strengthBgColor} ${strength <= 2 ? 'text-red-600' : strength <= 4 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {strengthLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs">
                        {req.met ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-slate-300" />
                        )}
                        <span className={req.met ? "text-slate-600" : "text-slate-400"}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confPass">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confPass"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsPasswordDialogOpen(false)}
                disabled={changePasswordMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
