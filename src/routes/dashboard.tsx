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
  ClipboardCheck,
  TrendingDown,
  Download,
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

  // Real students see their own profile, not the admin dashboard
  // Pending staff see a blocking screen (handled in AppLayout), don't redirect
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
    { name: "Level 1", value: stats.level1, color: "oklch(0.62 0.16 162)" },
    { name: "Level 2", value: stats.level2, color: "oklch(0.82 0.17 84)" },
    { name: "Level 3", value: stats.level3, color: "oklch(0.58 0.22 27)" },
  ].filter((d) => d.value > 0);

  const cards = [
    { title: "Total Students", value: stats.total, icon: Users, color: "oklch(0.58 0.21 256)" },
    { title: "Level 1 (Toppers)", value: stats.level1, icon: Trophy, color: "oklch(0.62 0.16 162)" },
    { title: "Level 2 (Average)", value: stats.level2, icon: ClipboardCheck, color: "oklch(0.82 0.17 84)" },
    { title: "Level 3 (Low)", value: stats.level3, icon: TrendingDown, color: "oklch(0.58 0.22 27)" },
  ];

  if (isAdmin) {
    cards.push({ title: "Total Staff", value: staffStats.total, icon: Users, color: "oklch(0.7 0.1 200)" });
    if (staffStats.pending > 0) {
      cards.push({ title: "Pending Staff Approvals", value: staffStats.pending, icon: Users, color: "oklch(0.7 0.2 40)" });
    }
  }

  const filters: Filter[] = ["All", "Level 1", "Level 2", "Level 3"];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => void downloadReport("excel", filter).catch((error) => {
                toast.error(error instanceof Error ? error.message : "Report download failed");
              })}
            >
              Export as Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => void downloadReport("pdf", filter).catch((error) => {
                toast.error(error instanceof Error ? error.message : "Report download failed");
              })}
            >
              Export as PDF (.pdf)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className="border-t-4" style={{ borderTopColor: c.color }}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="mb-1 text-sm font-semibold text-muted-foreground">
                    {c.title}
                  </p>
                  <p className="text-4xl font-bold">{c.value}</p>
                </div>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `color-mix(in oklab, ${c.color} 15%, transparent)` }}
                >
                  <Icon className="h-6 w-6" style={{ color: c.color }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 flex flex-col">
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 flex-shrink-0">
              <h2 className="text-lg font-semibold">Student Performance</h2>
              <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
                {filters.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={
                      "rounded-md px-3 py-1 text-sm font-semibold transition-colors " +
                      (filter === f
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[500px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y bg-muted/50 text-left text-muted-foreground">
                      <th className="px-5 py-3 font-semibold">Student</th>
                      <th className="px-5 py-3 font-semibold">Department</th>
                      <th className="px-5 py-3 font-semibold">Reg No</th>
                      <th className="px-5 py-3 font-semibold">Total Marks</th>
                      <th className="px-5 py-3 text-center font-semibold">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id} className="border-b transition-colors hover:bg-muted/40">
                        <td className="px-5 py-3">
                          <Link
                            to="/students/$id"
                            params={{ id: s.id }}
                            className="flex items-center gap-3"
                          >
                            <Avatar className="h-9 w-9">
                              {s.profilePicUrl && (
                                <AvatarImage src={`${API_BASE}${s.profilePicUrl}`} alt={s.name} />
                              )}
                              <AvatarFallback className="bg-accent text-primary">
                                {s.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{s.name}</p>
                              <p className="text-xs text-muted-foreground">{s.email}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant="secondary">{s.department ? s.department : "N/A"}</Badge>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs">{s.regNo}</td>
                        <td className="px-5 py-3">
                          <p className="font-semibold">{s.totalMarks}</p>
                          <p className="text-xs text-muted-foreground">
                            Avg: {s.averageMarks.toFixed(1)}%
                          </p>
                        </td>
                        <td className="px-5 py-3 text-center">
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

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-2 text-lg font-semibold">Category Distribution</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <RTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No data to chart yet." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
