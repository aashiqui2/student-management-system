import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  User,
  FileText,
  FileSpreadsheet,
  Settings,
  PencilRuler,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout, user, isAdmin, isStaff, isStudent } = useAuth();
  const router = useRouter();

  const getNavigation = () => {
    if (isAdmin) {
      return [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Students", href: "/students", icon: Users },
        { name: "Assessments", href: "/assessments", icon: FileText },
        { name: "Staff Management", href: "/staff", icon: Briefcase },
        { name: "User Management", href: "/users", icon: Settings },
      ];
    } else if (isStaff) {
      return [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Students", href: "/students", icon: Users },
        { name: "Assessments", href: "/assessments", icon: FileText },
        { name: "Marks Entry", href: "/marks", icon: PencilRuler },
        { name: "My Profile", href: "/staff/profile", icon: User },
      ];
    } else if (isStudent) {
      return [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Assessments", href: "/assessments", icon: FileText },
        { name: "My Marks", href: "/marks", icon: PencilRuler },
        { name: "My Profile", href: "/profile", icon: User },
      ];
    }
    return [];
  };

  const navigation = getNavigation();

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/login", replace: true });
  };

  return (
    <aside
      className={cn(
        "relative shrink-0 border-r border-border bg-sidebar transition-all duration-300 flex flex-col h-screen sticky top-0",
        collapsed ? "w-[72px]" : "w-60",
      )}
    >
      <div className="flex h-full flex-col">
        <Link
          to="/"
          className={cn(
            "flex h-[72px] items-center px-4 hover:opacity-80 transition-opacity",
            collapsed ? "justify-center" : "gap-3",
          )}
        >
          <div className="flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.72_0.15_200)] p-1.5 text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">EduTrack</span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <div className="border-t border-border" />

        <nav className="flex flex-col gap-1 p-2 pt-4 overflow-y-auto flex-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed ? "justify-center" : "gap-3",
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-3/5 w-1 -translate-y-1/2 rounded-r bg-primary" />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
        
        <div className="border-t border-border p-2">
          <button
            onClick={handleLogout}
            title={collapsed ? "Log out" : undefined}
            className={cn(
              "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
              collapsed ? "justify-center" : "gap-3"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
