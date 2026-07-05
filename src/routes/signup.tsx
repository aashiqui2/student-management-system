import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, Eye, EyeOff, Loader2, User, Shield, CheckCircle2, XCircle, ArrowRight, GraduationCap, ChevronLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";

export const Route = createFileRoute("/signup")({
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, navigate]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [stream, setStream] = useState("");
  const [startYear, setStartYear] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("type") === "staff" ? "staff" : "student";
    }
    return "student";
  });

  const DEPARTMENTS = [
    {
      label: "Engineering",
      options: [
        { label: "Computer Science and Engineering (CSE)", value: "CSE" },
        { label: "Information Technology (IT)", value: "IT" },
        { label: "Artificial Intelligence and Machine Learning (AI & ML)", value: "AI & ML" },
        { label: "Artificial Intelligence and Data Science (AI & DS)", value: "AI & DS" },
        { label: "Computer Science and Business Systems (CSBS)", value: "CSBS" },
        { label: "Computer Engineering", value: "Computer Engineering" },
        { label: "Cyber Security", value: "Cyber Security" },
        { label: "Data Science", value: "Data Science" },
        { label: "Internet of Things (IoT)", value: "IoT" },
        { label: "Robotics and Artificial Intelligence", value: "Robotics and AI" },
        { label: "Software Engineering", value: "Software Engineering" },
        { label: "Cloud Computing", value: "Cloud Computing" },
        { label: "Blockchain Technology", value: "Blockchain Technology" }
      ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
      label: "Arts & Science",
      options: [
        { label: "B.Sc Computer Science", value: "B.Sc CS" },
        { label: "B.Sc Information Technology", value: "B.Sc IT" },
        { label: "B.Sc Artificial Intelligence", value: "B.Sc AI" },
        { label: "B.Sc Artificial Intelligence and Machine Learning", value: "B.Sc AI & ML" },
        { label: "B.Sc Data Science", value: "B.Sc Data Science" },
        { label: "B.Sc Cyber Security", value: "B.Sc Cyber Security" },
        { label: "B.Sc Computer Technology", value: "B.Sc Computer Technology" },
        { label: "B.Sc Software Systems", value: "B.Sc Software Systems" },
        { label: "B.Sc Computer Applications", value: "B.Sc Computer Applications" }
      ].sort((a, b) => a.label.localeCompare(b.label))
    }
  ];

  const SPECIALIZATIONS = [
    { label: "General", value: "General" },
    { label: "Artificial Intelligence", value: "Artificial Intelligence" },
    { label: "Machine Learning", value: "Machine Learning" },
    { label: "Artificial Intelligence & Machine Learning", value: "Artificial Intelligence & Machine Learning" },
    { label: "Data Science", value: "Data Science" },
    { label: "Cyber Security", value: "Cyber Security" },
    { label: "Information Security", value: "Information Security" },
    { label: "Ethical Hacking", value: "Ethical Hacking" },
    { label: "Cloud Computing", value: "Cloud Computing" },
    { label: "DevOps", value: "DevOps" },
    { label: "Internet of Things (IoT)", value: "IoT" },
    { label: "Blockchain", value: "Blockchain" },
    { label: "Full Stack Development", value: "Full Stack Development" },
    { label: "Software Engineering", value: "Software Engineering" },
    { label: "Mobile Application Development", value: "Mobile Application Development" },
    { label: "Web Development", value: "Web Development" },
    { label: "Computer Networks", value: "Computer Networks" },
    { label: "Network Security", value: "Network Security" },
    { label: "Database Management", value: "Database Management" },
    { label: "Computer Vision", value: "Computer Vision" },
    { label: "Natural Language Processing (NLP)", value: "NLP" },
    { label: "Robotics", value: "Robotics" },
    { label: "Embedded Systems", value: "Embedded Systems" },
    { label: "Big Data Analytics", value: "Big Data Analytics" },
    { label: "Game Development", value: "Game Development" },
    { label: "AR/VR", value: "AR/VR" },
    { label: "Quantum Computing", value: "Quantum Computing" }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const STREAMS = [
    {
      label: "Engineering",
      options: [
        { label: "B.E.", value: "B.E." },
        { label: "B.Tech.", value: "B.Tech." }
      ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
      label: "Arts & Science",
      options: [
        { label: "B.Sc", value: "B.Sc" }
      ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
      label: "Commerce",
      options: [
        { label: "B.Com", value: "B.Com" },
        { label: "B.Com Computer Applications", value: "B.Com Computer Applications" },
        { label: "B.Com Information Systems", value: "B.Com Information Systems" }
      ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
      label: "Management",
      options: [
        { label: "BBA", value: "BBA" },
        { label: "BBA Computer Applications", value: "BBA Computer Applications" }
      ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
      label: "Postgraduate",
      options: [
        { label: "M.E.", value: "M.E." },
        { label: "M.Tech.", value: "M.Tech." },
        { label: "MCA", value: "MCA" },
        { label: "M.Sc", value: "M.Sc" }
      ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
      label: "Diploma",
      options: [
        { label: "Diploma in Computer Engineering", value: "Diploma in Computer Engineering" },
        { label: "Diploma in Information Technology", value: "Diploma in Information Technology" },
        { label: "Diploma in AI & ML", value: "Diploma in AI & ML" },
        { label: "Diploma in Cyber Security", value: "Diploma in Cyber Security" },
        { label: "Diploma in Data Science", value: "Diploma in Data Science" }
      ].sort((a, b) => a.label.localeCompare(b.label))
    }
  ];



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error("Username can only contain letters, numbers, and underscores");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    const name = activeTab === "student" ? `${firstName} ${lastName}`.trim() : "";

    if (activeTab === "student") {
      const duration = parseInt(courseDuration);
      const expectedDuration = (stream === "B.Tech." || stream === "B.E.") ? 4 : 3;
      if (duration !== expectedDuration) {
        toast.error(`Invalid Course Duration. For ${stream}, the course must be exactly ${expectedDuration} years.`);
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
          ...(activeTab === "student" ? { name, email, department, stream, specialization, startYear: parseInt(startYear), courseDuration: parseInt(courseDuration) } : {})
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Registration failed");
      }

      if (activeTab === "staff") {
        toast.success("Account created! An administrator must approve your account.");
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

  const passwordRequirements = [
    { met: password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(password), text: "One uppercase letter" },
    { met: /[a-z]/.test(password), text: "One lowercase letter" },
    { met: /[0-9]/.test(password), text: "One number" },
    { met: /[^A-Za-z0-9]/.test(password), text: "One special character" },
  ];

  const strength = passwordRequirements.filter(r => r.met).length;
  const strengthColor = strength <= 2 ? "bg-red-500" : strength <= 4 ? "bg-amber-500" : "bg-emerald-500";
  const strengthBgColor = strength <= 2 ? "bg-red-500/10" : strength <= 4 ? "bg-amber-500/10" : "bg-emerald-500/10";
  const strengthLabel = strength <= 2 ? "Weak" : strength <= 4 ? "Medium" : "Strong";

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">EduTrack</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Start Your<br />
            <span className="text-purple-200">Educational Journey</span>
          </h1>

          <p className="text-lg text-indigo-100 max-w-md">
            Join thousands of students and educators managing academic success with EduTrack.
          </p>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-sm">Instant access to your academic records</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-sm">Track assessments and performance</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-sm">Secure and private data management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50 relative">
        <Link to="/" className="absolute top-6 right-6 sm:top-8 sm:right-8 group">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900 flex items-center gap-2">
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back to Home</span>
          </Button>
        </Link>
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">EduTrack</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Join EduTrack to manage your academic journey
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 h-auto p-1 rounded-xl">
                  <TabsTrigger
                    value="student"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 rounded-lg py-2.5 text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Student
                  </TabsTrigger>
                  <TabsTrigger
                    value="staff"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 rounded-lg py-2.5 text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Staff
                  </TabsTrigger>
                </TabsList>

                {activeTab === "staff" && (
                  <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
                    <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
                    <p className="text-xs text-amber-800">
                      <span className="font-semibold">Notice:</span> Staff accounts require admin approval before accessing staff tools.
                    </p>
                  </div>
                )}
              </Tabs>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
                      className="h-11 bg-slate-50 border-slate-200"
                      placeholder={activeTab === "student" ? "e.g. 2022CS01" : "e.g. jsmith"}
                    />
                    {username && !/^[a-zA-Z0-9_]+$/.test(username) && (
                      <p className="text-red-500 text-xs mt-1">Username can only contain letters, numbers, and underscores</p>
                    )}
                  </div>

                  {activeTab === "student" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">First Name</Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="h-11 bg-slate-50 border-slate-200"
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">Last Name</Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="h-11 bg-slate-50 border-slate-200"
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 bg-slate-50 border-slate-200"
                          placeholder="john.doe@school.com"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Department</Label>
                          <SearchableSelect 
                            groups={DEPARTMENTS} 
                            value={department} 
                            onValueChange={setDepartment} 
                            placeholder="Select Department" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Stream</Label>
                          <SearchableSelect 
                            groups={STREAMS} 
                            value={stream} 
                            onValueChange={setStream} 
                            placeholder="Select Stream" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Specialization</Label>
                          <SearchableSelect 
                            options={SPECIALIZATIONS} 
                            value={specialization} 
                            onValueChange={setSpecialization} 
                            placeholder="Select Specialization" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startYear" className="text-sm font-medium text-slate-700">Start Year</Label>
                          <Select value={startYear} onValueChange={setStartYear} required>
                            <SelectTrigger id="startYear" className="h-11 bg-slate-50 border-slate-200">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 13 }, (_, i) => String(2018 + i)).map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="courseDuration" className="text-sm font-medium text-slate-700">Course Duration (Years)</Label>
                          <Select value={courseDuration} onValueChange={setCourseDuration} required>
                            <SelectTrigger id="courseDuration" className="h-11 bg-slate-50 border-slate-200">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map(year => (
                                <SelectItem key={year} value={String(year)}>{year} {year === 1 ? 'Year' : 'Years'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 pr-11 bg-slate-50 border-slate-200 focus:border-indigo-500 transition-all"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {password && (
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={`h-11 pr-11 bg-slate-50 border-slate-200 transition-all ${confirmPassword ? (passwordsMatch ? 'border-emerald-500 focus:border-emerald-500' : 'border-red-400 focus:border-red-400') : ''}`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      {confirmPassword && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                          {passwordsMatch ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                      )}
                    </div>
                    {confirmPassword && !passwordsMatch && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100">
              <p className="text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  search={{ type: activeTab }}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
