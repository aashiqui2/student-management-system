import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, ShieldCheck, TrendingUp, Users, ChartBar as BarChart3, ArrowRight, CircleCheck as CheckCircle2, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">EduTrack</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/50 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 text-blue-700 text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Trusted by 500+ educational institutions
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Manage your institution with
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> EduTrack</span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl">
              The modern platform for tracking student progress, managing assessments, and analyzing performance with role-based access control.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 text-base">
                    Go to your Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 text-base">
                      Start for free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="h-12 px-8 border-slate-200 text-slate-700 hover:bg-slate-50">
                      Sign in
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="mt-12 flex items-center gap-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-slate-600">Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-slate-600">No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-slate-600">Setup in minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-slate-600">
              Powerful tools designed to streamline your institution's academic management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 mb-6">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Student Management</h3>
                <p className="text-slate-600 leading-relaxed">
                  Maintain detailed records of students, their academics, and external profiles all in one centralized system.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 mb-6">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Assessment Tracking</h3>
                <p className="text-slate-600 leading-relaxed">
                  Create assessments, bulk upload marks, and instantly visualize class performance via the dashboard.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 mb-6">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Secure Access Control</h3>
                <p className="text-slate-600 leading-relaxed">
                  Role-based access ensures only authorized users can modify records while maintaining data security.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25 mb-6">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Performance Analytics</h3>
                <p className="text-slate-600 leading-relaxed">
                  Visualize trends, identify at-risk students, and make data-driven decisions with comprehensive reports.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-amber-100 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 mb-6">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Excel Import/Export</h3>
                <p className="text-slate-600 leading-relaxed">
                  Bulk import students and marks via Excel templates. Export reports in multiple formats instantly.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-rose-100 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25 mb-6">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Multi-Portal Access</h3>
                <p className="text-slate-600 leading-relaxed">
                  Separate portals for Students, Staff, and Administrators with role-specific features and dashboards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Built for modern education
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                EduTrack was designed to bridge the gap between administrative overhead and student success.
                We provide a sleek, intuitive interface for educators to effortlessly monitor academics
                and for students to track their progress.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Intuitive Design</h4>
                    <p className="text-sm text-slate-600">Clean interface that requires minimal training</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Secure & Private</h4>
                    <p className="text-sm text-slate-600">Role-based access with encrypted data storage</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Real-time Updates</h4>
                    <p className="text-sm text-slate-600">Instant synchronization across all devices</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <p className="text-3xl font-bold text-blue-600">500+</p>
                    <p className="text-sm text-blue-700 mt-1">Institutions</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-6 text-center">
                    <p className="text-3xl font-bold text-indigo-600">50K+</p>
                    <p className="text-sm text-indigo-700 mt-1">Students</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-6 text-center">
                    <p className="text-3xl font-bold text-emerald-600">100K+</p>
                    <p className="text-sm text-emerald-700 mt-1">Assessments</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-6 text-center">
                    <p className="text-3xl font-bold text-amber-600">99.9%</p>
                    <p className="text-sm text-amber-700 mt-1">Uptime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your institution?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join hundreds of educational institutions already using EduTrack to streamline their operations.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="h-12 px-8 bg-white text-blue-700 hover:bg-blue-50 shadow-xl text-base font-semibold">
                  Go to your Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" className="h-12 px-8 bg-white text-blue-700 hover:bg-blue-50 shadow-xl text-base font-semibold">
                    Get started - it's free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent border-white/30 text-white hover:bg-white/10 text-base">
                    Sign in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EduTrack</span>
            </div>

            <p className="text-sm">
              &copy; 2026 EduTrack Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
