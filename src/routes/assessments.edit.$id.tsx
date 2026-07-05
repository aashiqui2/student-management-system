import { createFileRoute, useParams } from "@tanstack/react-router";
import { AssessmentForm } from "@/components/sms/AssessmentForm";
import { RequireRole } from "@/lib/auth";

export const Route = createFileRoute("/assessments/edit/$id")({
  head: () => ({
    meta: [{ title: "Edit Assessment — EduTrack" }],
  }),
  component: EditAssessment,
});

function EditAssessment() {
  const { id } = useParams({ from: "/assessments/edit/$id" });
  return (
    <RequireRole roles={["ADMIN", "STAFF"]}>
      <AssessmentForm id={id} />
    </RequireRole>
  );
}
