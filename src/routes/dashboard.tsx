import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  Legend,
} from "recharts";
import {
  Users,
  Trophy,
  Target,
  TrendingDown,
  Download,
  ArrowUpRight,
  UserCheck,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useSMS, type Category } from "@/lib/sms-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/sms/CategoryBadge";
import { EmptyState } from "@/components/sms/EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { toast } from "sonner";
import { downloadReport, API_BASE } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EduTrack" },
      {
        name: "description",
        content:
          "Track student performance, categories and assessment results at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

type Filter = "All" | Category;

function Dashboard() {
  const { summaries } = useSMS();
  const { isStudent, isAdmin, user, isPendingStaff } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("All");
  const [staffStats, setStaffStats] = useState({ total: 0, pending: 0 });

  useEffect(() => {
    if (isStudent && !isPendingStaff) {
      navigate({ to: "/profile" });
    }
  }, [isStudent, isPendingStaff, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
        .then((res) => {
          if (res.ok) return res.json();
          return [];
        })
        .then((data: any[]) => {
          const staffCount = data.filter((u) => u.role === "STAFF").length;
          const pendingCount = data.filter((u) => u.role === "STUDENT" && u.username.endsWith("_staff")).length;
          setStaffStats({ total: staffCount, pending: pendingCount });
        })
        .catch(console.error);
    }
  }, [isAdmin]);

  const stats = useMemo(() => {
    return {
      total: summaries.length,
      level1: summaries.filter((s) => s.category === "Level 1").length,
      level2: summaries.filter((s) => s.category === "Level 2").length,
      level3: summaries.filter((s) => s.category === "Level 3").length,
    };
  }, [summaries]);

  const filtered =
    filter === "All"
      ? summaries
      : summaries.filter((s) => s.category === filter);

  const pieData = [
    { name: "Level 1", value: stats.level1, color: "#10b981" },
    { name: "Level 2", value: stats.level2, color: "#f59e0b" },
    { name: "Level 3", value: stats.level3, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const statCards = [
    {
      title: "Total Students",
      value: stats.total,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/10",
      change: "+12%",
      positive: true
    },
    {
      title: "Level 1 Toppers",
      value: stats.level1,
      icon: Trophy,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-500/10 to-emerald-600/10",
      change: `${stats.total > 0 ? ((stats.level1 / stats.total) * 100).toFixed(0) : 0}%`,
      positive: true
    },
    {
      title: "Level 2 Average",
      value: stats.level2,
      icon: Target,
      gradient: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-500/10 to-amber-600/10",
      change: `${stats.total > 0 ? ((stats.level2 / stats.total) * 100).toFixed(0) : 0}%`,
      positive: true
    },
    {
      title: "Level 3 Low",
      value: stats.level3,
      icon: TrendingDown,
      gradient: "from-rose-500 to-rose-600",
      bgGradient: "from-rose-500/10 to-rose-600/10",
      change: `${stats.total > 0 ? ((stats.level3 / stats.total) * 100).toFixed(0) : 0}%`,
      positive: false
    },
  ];

  if (isAdmin) {
    statCards.push({
      title: "Total Staff",
      value: staffStats.total,
      icon: Users,
      gradient: "from-cyan-500 to-cyan-600",
      bgGradient: "from-cyan-500/10 to-cyan-600/10",
      change: "Active",
      positive: true
    });

    if (staffStats.pending > 0) {
      statCards.push({
        title: "Pending Approvals",
        value: staffStats.pending,
        icon: Clock,
        gradient: "from-orange-500 to-orange-600",
        bgGradient: "from-orange-500/10 to-orange-600/10",
        change: "Waiting",
        positive: false
      });
    }
  }

  const filters: Filter[] = ["All", "Level 1", "Level 2", "Level 3"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Monitor student performance and academic progress</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => void downloadReport("excel", filter).catch((error) => {
                toast.error(error instanceof Error ? error.message : "Report download failed");
              })}
              className="cursor-pointer"
            >
              <span className="font-medium">Excel (.xlsx)</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => void downloadReport("pdf", filter).catch((error) => {
                toast.error(error instanceof Error ? error.message : "Report download failed");
              })}
              className="cursor-pointer"
            >
              <span className="font-medium">PDF (.pdf)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-50`}></div>
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">{card.title}</p>
                    <p className="text-4xl font-bold text-slate-900">{card.value}</p>
                    <div className="flex items-center gap-1 text-xs">
                      <span className={card.positive ? "text-emerald-600" : "text-rose-600"}>
                        {card.change}
                      </span>
                      <span className="text-slate-400">of total</span>
                    </div>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Performance Table */}
        <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Student Performance</h2>
                  <p className="text-sm text-slate-500">Track and categorize student progress</p>
                </div>

                <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1">
                  {filters.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        filter === f
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="overflow-x-auto max-h-[450px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm">
                    <tr className="border-b border-slate-100 text-left text-slate-600">
                      <th className="px-6 py-4 font-semibold">Student</th>
                      <th className="px-6 py-4 font-semibold">Stream</th>
                      <th className="px-6 py-4 font-semibold">Specialization</th>
                      <th className="px-6 py-4 font-semibold">Reg No</th>
                      <th className="px-6 py-4 font-semibold">Performance</th>
                      <th className="px-6 py-4 text-center font-semibold">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                        onClick={() => navigate({ to: "/students/$id", params: { id: s.id } })}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-slate-100 group-hover:ring-blue-100 transition-colors">
                              {s.profilePicUrl && (
                                <AvatarImage src={`${API_BASE}/api/students/${s.id}/photo`} alt={s.name} />
                              )}
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                {s.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {s.name}
                              </p>
                              <p className="text-xs text-slate-400">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-medium border-slate-200 bg-slate-50">
                            {s.stream || "N/A"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-medium border-slate-200 bg-slate-50">
                            {s.specialization || "N/A"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                            {s.regNo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{s.totalMarks} marks</p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-24">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                                  style={{ width: `${Math.min(s.averageMarks, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500">{s.averageMarks.toFixed(0)}%</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <CategoryBadge category={s.category} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="No students match the current category." />
            )}
          </CardContent>
        </Card>

        {/* Category Distribution Chart */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Category Distribution</h2>
              <p className="text-sm text-slate-500">Student categorization overview</p>
            </div>

            <div className="p-6">
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={4}
                        strokeWidth={0}
                      >
                        {pieData.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                      <RTooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          padding: '8px 12px'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => (
                          <span className="text-sm font-medium text-slate-600">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="mt-6 space-y-3">
                    {pieData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium text-slate-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">{item.value}</span>
                          <span className="text-xs text-slate-400 ml-1">
                            ({stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(0) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState message="No data to chart yet." />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
