import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/signup")({
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [degree, setDegree] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Read active tab from query parameters if available
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("type") === "staff" ? "staff" : "student";
    }
    return "student";
  });

  const isEngineering = degree === "BE" || degree === "B.Tech";
  const isBachelor = degree === "B.Sc" || degree === "BA" || degree === "B.Com";
  const ENGG_DEPARTMENTS = ["ECE", "EEE", "MECH", "CIVIL", "CSBS", "IT", "AIDS", "CSE"];
  const ARTS_SCIENCE_DEPARTMENTS = ["CS", "Physics", "Chemistry", "Mathematics", "Commerce", "English", "Economics"];
  
  const availableDepartments = isEngineering 
    ? ENGG_DEPARTMENTS 
    : isBachelor 
      ? ARTS_SCIENCE_DEPARTMENTS 
      : [];

  useEffect(() => {
    if (department && availableDepartments.length > 0 && !availableDepartments.includes(department)) {
      setDepartment("");
    }
  }, [degree]); // Only check when degree changes to avoid endless loops since availableDepartments is computed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    
    const name = activeTab === "student" ? `${firstName} ${lastName}`.trim() : "";
    
    if (activeTab === "student") {
      const start = parseInt(startYear);
      const end = parseInt(endYear);
      const expectedDuration = (degree === "BE" || degree === "B.Tech") ? 4 : 3;
      if (end - start !== expectedDuration) {
        toast.error(`Invalid End Year. For ${degree}, graduation must be exactly ${expectedDuration} years after Start Year.`);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          password, 
          roleType: activeTab,
          ...(activeTab === "student" ? { name, email, department, degree, startYear: parseInt(startYear), endYear: parseInt(endYear) } : {}) 
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Registration failed");
      }
      const data = await res.json();
      
      if (activeTab === "staff") {
        toast.success("Account created! An administrator must promote your account to Staff in User Management before accessing the Staff Portal.");
      } else {
        toast.success("Account created successfully! Please log in.");
      }
      navigate({ to: "/login", search: { type: activeTab } });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthColor = strength <= 2 ? "bg-red-500" : strength <= 4 ? "bg-yellow-500" : "bg-green-500";
  const strengthLabel = strength <= 2 ? "Weak" : strength <= 4 ? "Medium" : "Strong";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-background p-8 shadow-lg ring-1 ring-border/50">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join EduTrack to access your records
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student Signup</TabsTrigger>
            <TabsTrigger value="staff">Staff Registration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="student" className="mt-2 space-y-4">
            <div className="text-sm text-muted-foreground text-center mt-2">
              Sign up as a Student. Accounts will immediately have Student access.
            </div>
          </TabsContent>
          
          <TabsContent value="staff" className="mt-2 space-y-4">
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 mt-2 flex gap-2.5 items-start">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-semibold">Notice</span>: All staff signups are registered with basic student privileges initially. An Admin must change your role to **Staff** in User Management to enable Staff tools.
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{activeTab === "student" ? "Registration Number" : "Username"}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder={activeTab === "student" ? "e.g. 2022CS01" : "e.g. jsmith_staff"}
              />
            </div>

            {activeTab === "student" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. john.doe@school.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="degree">Stream</Label>
                    <Select value={degree} onValueChange={setDegree} required>
                      <SelectTrigger id="degree">
                        <SelectValue placeholder="Select Stream" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BE">BE</SelectItem>
                        <SelectItem value="B.Tech">B.Tech</SelectItem>
                        <SelectItem value="B.Sc">B.Sc</SelectItem>
                        <SelectItem value="BA">BA</SelectItem>
                        <SelectItem value="B.Com">B.Com</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Specialization</Label>
                    <Select value={department} onValueChange={setDepartment} required disabled={!degree}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder={degree ? "Select Specialization" : "Select Stream First"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDepartments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startYear">Start Year</Label>
                    <Select value={startYear} onValueChange={setStartYear} required>
                      <SelectTrigger id="startYear">
                        <SelectValue placeholder="Start Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 13 }, (_, i) => String(2018 + i)).map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endYear">End Year</Label>
                    <Select value={endYear} onValueChange={setEndYear} required>
                      <SelectTrigger id="endYear">
                        <SelectValue placeholder="End Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 13 }, (_, i) => String(2018 + i)).map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {password && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strengthColor}`} 
                      style={{ width: `${(Math.min(strength, 5) / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{strengthLabel}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : `Sign up as ${activeTab === "student" ? "Student" : "Staff"}`}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground pt-2 border-t border-border/50">
          Already have an account?{" "}
          <Link 
            to="/login" 
            search={{ type: activeTab }} 
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
