import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, ShieldCheck, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      {/* Header / Navbar for public site */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <GraduationCap className="h-6 w-6" />
          <span>EduTrack</span>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <a href="#about" className="hover:text-primary transition-colors">About</a>
          <a href="#services" className="hover:text-primary transition-colors">Services</a>
          <div className="ml-4 flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900">
                Manage your institution with <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">EduTrack</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                The modern, premium platform for tracking student progress, managing assessments, and analyzing performance with role-based access control.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/signup">
                  <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all">
                    Get started for free
                  </Button>
                </Link>
                <Link to="/login" className="text-sm font-semibold leading-6 hover:text-primary transition-colors">
                  Log in to your account <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 sm:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">About Us</h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                EduTrack was built to bridge the gap between administrative overhead and student success. 
                We provide a sleek, intuitive interface for educators to effortlessly monitor academics.
              </p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 sm:py-32 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Services</h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Everything you need to run your educational institution efficiently.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <dt className="text-xl font-semibold leading-7">Student Management</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">Maintain detailed records of your students, their academics, and external profiles in one place.</p>
                  </dd>
                </div>

                <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <dt className="text-xl font-semibold leading-7">Assessment Tracking</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">Create assessments and bulk upload marks. Instantly visualize class performance via the dashboard.</p>
                  </dd>
                </div>

                <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <dt className="text-xl font-semibold leading-7">Secure Access Control</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">Role-based access ensures only administrators can modify records, while users can view data securely.</p>
                  </dd>
                </div>

              </dl>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-white border-t py-12 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 EduTrack Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
