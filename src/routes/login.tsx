import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Eye, EyeOff, Loader as Loader2, User, Shield, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("student");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Invalid username or password");
      const data = await res.json();
      login({ username: data.username, token: data.token, role: data.role });

      if (data.role === "STUDENT") {
        const isPendingStaff = data.username?.endsWith("_staff");

        if (activeTab === "staff" && !isPendingStaff) {
          throw new Error("Invalid login: Students must use the Student Portal.");
        } else if (activeTab === "student" && isPendingStaff) {
          throw new Error("Invalid login: Staff members must use the Staff / Admin Portal.");
        }

        if (isPendingStaff) {
          toast.info("Your account is pending admin approval. Please wait.");
          navigate({ to: "/dashboard" });
        } else {
          toast.success("Welcome back!");
          navigate({ to: "/profile" });
        }
      } else {
        if (activeTab === "student") {
          throw new Error("Invalid login: Staff and Admin must use the Staff / Admin Portal.");
        }

        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">EduTrack</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Empowering Education<br />
            <span className="text-blue-200">Through Technology</span>
          </h1>

          <p className="text-lg text-blue-100 max-w-md">
            A comprehensive platform for student management, assessment tracking, and academic performance analysis.
          </p>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/80">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-sm">Secure Login</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-sm">Real-time Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">EduTrack</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Sign in to access your account
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 h-auto p-1 rounded-xl">
                  <TabsTrigger
                    value="student"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg py-2.5 text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Student
                  </TabsTrigger>
                  <TabsTrigger
                    value="staff"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg py-2.5 text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Staff / Admin
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500">
                    {activeTab === "student"
                      ? "Access your marks, profile, and academic records"
                      : "Manage students, assessments, and reports"
                    }
                  </p>
                </div>
              </Tabs>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                      {activeTab === "student" ? "Registration Number" : "Username"}
                    </Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                      className="h-11 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                      placeholder={activeTab === "student" ? "e.g. 2022CS01" : "e.g. admin or jsmith"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 pr-11 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100">
              <p className="text-center text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  search={{ type: activeTab }}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
