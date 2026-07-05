import { createFileRoute, useParams, Navigate } from "@tanstack/react-router";
import { StudentForm } from "@/components/sms/StudentForm";
import { RequireRole, useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/students/edit/$id")({
  head: () => ({
    meta: [{ title: "Edit Student — EduTrack" }],
  }),
  component: EditStudent,
});

function EditStudent() {
  const { id } = useParams({ from: "/students/edit/$id" });
  const { isStudent, isAdmin } = useAuth();
  const myProfileQuery = useQuery({
    queryKey: ["myStudentProfile"],
    queryFn: api.getMyStudentProfile,
    enabled: isStudent,
  });

  if (isStudent && myProfileQuery.isSuccess) {
    if (myProfileQuery.data.id.toString() !== id) {
      return <Navigate to="/dashboard" />;
    }
  }

  return (
    <RequireRole roles={["ADMIN", "STAFF", "STUDENT"]}>
      <StudentForm id={id} />
    </RequireRole>
  );
}
