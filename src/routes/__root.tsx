import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SMSProvider } from "../lib/sms-data";
import { AuthProvider, useAuth } from "../lib/auth";
import { Sidebar } from "../components/sms/Sidebar";
import { Toaster } from "../components/ui/sonner";
import { ShieldAlert, LogOut } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SMS" },
      { name: "description", content: "StudentManagementSystem" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "SMS" },
      { property: "og:description", content: "StudentManagementSystem" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "SMS" },
      { name: "twitter:description", content: "StudentManagementSystem" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/76315a97-57e8-4689-a86b-c822efb5a3d3/id-preview-4a4b983f--efea6bcd-b2c6-4b4e-8b84-d31ffe6f9af9.lovable.app-1782749355536.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/76315a97-57e8-4689-a86b-c822efb5a3d3/id-preview-4a4b983f--efea6bcd-b2c6-4b4e-8b84-d31ffe6f9af9.lovable.app-1782749355536.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SMSProvider>
          <AppLayout />
          <Toaster richColors position="top-right" />
        </SMSProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { user, isPendingStaff, logout } = useAuth();
  const pathname = router.state.location.pathname;
  const isPublic = pathname === "/" || pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    if (!isPublic && !user) {
      router.navigate({ to: "/login" });
    }
  }, [isPublic, user, router]);

  if (!isPublic && !user) {
    return null;
  }

  if (isPublic) {
    return (
      <main className="w-full">
        <Outlet />
      </main>
    );
  }

  // Pending staff: show a blocking waiting screen
  if (isPendingStaff) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-8 text-center gap-6">
        <div className="rounded-full bg-amber-100 p-5">
          <ShieldAlert className="h-12 w-12 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Account Pending Approval</h1>
          <p className="text-muted-foreground max-w-md">
            Your staff registration request is waiting for an administrator to review and approve it.
            Once approved, you will have full access to the Staff Portal.
          </p>
          <p className="text-sm text-muted-foreground">
            Logged in as <span className="font-mono font-semibold text-foreground">{user?.username}</span>
          </p>
        </div>
        <button
          onClick={() => { logout(); router.navigate({ to: "/login" }); }}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
