import { createFileRoute } from "@tanstack/react-router";
import { StudentForm } from "@/components/sms/StudentForm";
import { RequireRole } from "@/lib/auth";

export const Route = createFileRoute("/students/new")({
  head: () => ({
    meta: [{ title: "Register Student — EduTrack" }],
  }),
  component: () => (
    <RequireRole roles={["ADMIN", "STAFF"]}>
      <StudentForm />
    </RequireRole>
  ),
});
