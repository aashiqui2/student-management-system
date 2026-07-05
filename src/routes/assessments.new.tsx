import { createFileRoute } from "@tanstack/react-router";
import { AssessmentForm } from "@/components/sms/AssessmentForm";
import { RequireRole } from "@/lib/auth";

export const Route = createFileRoute("/assessments/new")({
  head: () => ({
    meta: [{ title: "New Assessment — EduTrack" }],
  }),
  component: () => (
    <RequireRole roles={["ADMIN", "STAFF"]}>
      <AssessmentForm />
    </RequireRole>
  ),
});
