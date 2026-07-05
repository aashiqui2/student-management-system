import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
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
  Trophy,
  Target,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";
import { useSMS } from "@/lib/sms-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { CategoryBadge } from "@/components/sms/CategoryBadge";
import { EmptyState } from "@/components/sms/EmptyState";

export function StudentDashboardView() {
  const { user } = useAuth();
  const { assessments, marks, getSummary } = useSMS();

  const myProfileQuery = useQuery({
    queryKey: ["myStudentProfile"],
    queryFn: api.getMyStudentProfile,
  });

  const student = myProfileQuery.data;
  const summary = student ? getSummary(student.id.toString()) : undefined;

  if (myProfileQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  if (!student || !summary) {
    return (
      <EmptyState
        message="Unable to load your dashboard data."
        actionLabel="Retry"
        onAction={() => myProfileQuery.refetch()}
      />
    );
  }

  const history = assessments
    .filter((a) => `${student.id}:${a.id}` in marks)
    .map((a) => {
      const scored = marks[`${student.id}:${a.id}`];
      return {
        name: a.assessmentName,
        date: a.dateConducted,
        scored,
        total: a.totalMarks,
        pct: a.totalMarks > 0 ? (scored / a.totalMarks) * 100 : 0,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const chartData = [...history].reverse().map((h) => ({
    name: h.name.length > 12 ? `${h.name.slice(0, 12)}…` : h.name,
    percentage: Number(h.pct.toFixed(1)),
  }));

  const recentAssessments = history.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {student.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your academic performance.
          </p>
        </div>
        <Link to="/profile">
          <Button variant="outline" className="gap-2">
            View Full Profile <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Assessments</p>
                <p className="text-3xl font-bold text-slate-900">{summary.attempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border-indigo-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Average Marks</p>
                <p className="text-3xl font-bold text-slate-900">{summary.averageMarks.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Current Category</p>
                <div className="mt-1">
                  <CategoryBadge category={summary.category} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Performance Trend</h3>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} dy={10} />
                  <YAxis domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                  <RTooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#4f46e5"
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#4f46e5' }}
                    activeDot={{ r: 6, fill: '#4f46e5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Complete an assessment to see your trend." />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Recent Assessments</h3>
              <Trophy className="h-5 w-5 text-indigo-500" />
            </div>
            {recentAssessments.length > 0 ? (
              <div className="space-y-4">
                {recentAssessments.map((h, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900">{h.name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(h.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{h.scored} / {h.total}</p>
                        <p className="text-xs text-slate-500">Marks</p>
                      </div>
                      <Badge className={
                        h.pct >= 75 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                        h.pct >= 50 ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
                        "bg-rose-100 text-rose-700 hover:bg-rose-200"
                      }>
                        {h.pct.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No recent assessments found." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
