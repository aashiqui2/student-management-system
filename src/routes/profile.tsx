import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  component: ProfileRedirect,
});

function ProfileRedirect() {
  const { isStudent, isPendingStaff } = useAuth();
  const navigate = useNavigate();

  // isPendingStaff is technically STUDENT role, but shouldn't be here
  const isRealStudent = isStudent && !isPendingStaff;

  const myProfileQuery = useQuery({
    queryKey: ["myStudentProfile"],
    queryFn: api.getMyStudentProfile,
    enabled: isRealStudent,
    retry: false
  });

  useEffect(() => {
    if (isPendingStaff) {
      navigate({ to: "/dashboard" }); // pending screen
      return;
    }
    if (isRealStudent) {
      if (myProfileQuery.isSuccess && myProfileQuery.data) {
        navigate({ to: "/students/$id", params: { id: myProfileQuery.data.id.toString() } });
      } else if (myProfileQuery.isError) {
        // Stay here and let the error message show
      }
    } else {
      navigate({ to: "/dashboard" });
    }
  }, [isPendingStaff, isRealStudent, myProfileQuery.isSuccess, myProfileQuery.isError, myProfileQuery.data, navigate]);

  if (isRealStudent && myProfileQuery.isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Profile not found or access denied. Please contact an administrator.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p>Loading profile...</p>
      </div>
    </div>
  );
}
