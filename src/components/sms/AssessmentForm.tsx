import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Upload, FileText, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import {
  useSMS,
  type Assessment,
  type AssessmentResource,
} from "@/lib/sms-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormValues = {
  assessmentName: string;
  dateConducted: string;
  totalMarks: number;
};

const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.sql,.txt";

export function AssessmentForm({ id }: { id?: string }) {
  const navigate = useNavigate();
  const { getAssessment, addAssessment, updateAssessment } = useSMS();
  const isEdit = Boolean(id);
  const existing = id ? getAssessment(id) : undefined;
  const fileInput = useRef<HTMLInputElement>(null);
  const [resources, setResources] = useState<AssessmentResource[]>(existing?.resources ?? []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: existing
      ? {
          assessmentName: existing.assessmentName,
          dateConducted: existing.dateConducted,
          totalMarks: existing.totalMarks,
        }
      : { assessmentName: "", dateConducted: "", totalMarks: 100 },
  });

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setPendingFiles((prev) => [...prev, ...files]);
    toast.success(`Added ${files.length} resource file(s).`);
  };

  const removePendingFile = (idx: number) =>
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async (data: FormValues) => {
    const payload: Omit<Assessment, "id"> = {
      assessmentName: data.assessmentName,
      dateConducted: data.dateConducted,
      totalMarks: Number(data.totalMarks),
      resources,
    };

    try {
      if (isEdit && id) {
        await updateAssessment(id, payload, pendingFiles);
        toast.success("Assessment updated");
      } else {
        await addAssessment(payload, pendingFiles);
        toast.success("Assessment created");
      }
      navigate({ to: "/assessments" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save assessment. Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate({ to: "/assessments" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? "Edit Assessment" : "New Assessment"}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label>Assessment Name</Label>
              <Input
                {...register("assessmentName", { required: "Name is required" })}
              />
              {errors.assessmentName && (
                <p className="text-xs text-destructive">
                  {errors.assessmentName.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Date Conducted</Label>
                <Input
                  type="date"
                  {...register("dateConducted", { required: "Date is required" })}
                />
                {errors.dateConducted && (
                  <p className="text-xs text-destructive">
                    {errors.dateConducted.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  {...register("totalMarks", {
                    required: "Total marks required",
                    min: { value: 1, message: "Must be at least 1" },
                  })}
                />
                {errors.totalMarks && (
                  <p className="text-xs text-destructive">
                    {errors.totalMarks.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label>Resources (question files)</Label>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  accept={ACCEPTED}
                  className="hidden"
                  onChange={onUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInput.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Attach question papers in PDF, Word, Excel, or SQL files.
              </p>
              {resources.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Existing resources</div>
                  <ul className="divide-y rounded-md border">
                    {resources.map((r, i) => (
                      <li
                        key={`${r.name}-${i}`}
                        className="flex items-center justify-between gap-3 px-3 py-2"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-primary" />
                          <span className="truncate text-sm">{r.name}</span>
                        </span>
                        <a href={r.downloadUrl} target="_blank" rel="noreferrer">
                          <Button type="button" variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {pendingFiles.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">New files to upload</div>
                  <ul className="divide-y rounded-md border">
                    {pendingFiles.map((file, i) => (
                      <li
                        key={`${file.name}-${i}`}
                        className="flex items-center justify-between gap-3 px-3 py-2"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-primary" />
                          <span className="truncate text-sm">{file.name}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removePendingFile(i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : resources.length === 0 ? (
                <p className="rounded-md border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
                  No resource files attached yet.
                </p>
              ) : null}
            </div>


            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/assessments" })}
              >
                Cancel
              </Button>
              <Button type="submit">{isEdit ? "Save Changes" : "Create"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
