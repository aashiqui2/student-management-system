import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        
        // Ensure standard students use the Student portal, and pending staff use the Staff portal
        if (activeTab === "staff" && !isPendingStaff) {
          throw new Error("Invalid login: Students must use the Student Portal.");
        } else if (activeTab === "student" && isPendingStaff) {
          throw new Error("Invalid login: Staff members must use the Staff / Admin Portal.");
        }

        if (isPendingStaff) {
          toast.info("Your account is pending admin approval. Please wait.");
          navigate({ to: "/dashboard" }); // AppLayout will show the pending screen
        } else {
          toast.success("Welcome back!");
          navigate({ to: "/profile" });
        }
      } else {
        // Enforce that Staff/Admin use the Staff portal
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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-background p-8 shadow-lg ring-1 ring-border/50">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">EduTrack Portal</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your account
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student Portal</TabsTrigger>
            <TabsTrigger value="staff">Staff / Admin Portal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="student" className="mt-2 space-y-4">
            <div className="text-sm text-muted-foreground text-center mt-2">
              Access your assessment marks and profile details.
            </div>
          </TabsContent>
          
          <TabsContent value="staff" className="mt-2 space-y-4">
            <div className="text-sm text-muted-foreground text-center mt-2">
              Manage student records, grades, and administrative tools.
            </div>
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder={activeTab === "student" ? "e.g. 2022CS01" : "e.g. admin or staff_user"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : `Sign in as ${activeTab === "student" ? "Student" : "Staff / Admin"}`}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground pt-2 border-t border-border/50">
          Don't have an account?{" "}
          <Link 
            to="/signup" 
            search={{ type: activeTab }} 
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
