import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { RequireRole } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";
import { PencilRuler, Save, Upload, Download } from "lucide-react";
import { api } from "@/lib/api";
import { useSMS } from "@/lib/sms-data";
import { downloadMarksTemplate } from "@/lib/excel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/sms/EmptyState";
import { toast } from "sonner";

type ImportIssue = {
  row?: number;
  reason: string;
};

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/marks")({
  head: () => ({
    meta: [
      { title: "Marks Entry — EduTrack" },
      { name: "description", content: "Record assessment marks for students." },
    ],
  }),
  component: MarksEntry,
});

function MarksEntry() {
  const queryClient = useQueryClient();
  const { assessments, students, marks, setMark, setMarksByRegNo } = useSMS();
  const [selected, setSelected] = useState<string>("");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [importErrors, setImportErrors] = useState<ImportIssue[]>([]);
  const [showImportErrors, setShowImportErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });
  const fileInput = useRef<HTMLInputElement>(null);


  const assessment = assessments.find((a) => a.id === selected);

  const onSelect = (id: string) => {
    setSelected(id);
  };

  useEffect(() => {
    if (!selected) return;
    const next: Record<string, string> = {};
    for (const s of students) {
      const key = `${s.id}:${selected}`;
      next[s.id] = key in marks ? String(marks[key]) : "";
    }
    setDraft(next);
  }, [selected, students, marks]);

  const save = async () => {
    if (!assessment) return;
    
    const ops = [];
    for (const s of students) {
      const raw = draft[s.id];
      if (raw === undefined || raw === "") {
        ops.push({ studentId: s.id, val: null, regNo: s.regNo });
      } else {
        const val = Number(raw);
        if (!Number.isNaN(val)) {
          const clamped = Math.max(0, Math.min(val, assessment.totalMarks));
          ops.push({ studentId: s.id, val: clamped, regNo: s.regNo });
        }
      }
    }

    if (ops.length === 0) return;

    setIsSaving(true);
    setSaveProgress({ current: 0, total: ops.length });
    
    let successCount = 0;
    const failures = [];

    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      try {
        await setMark(op.studentId, assessment.id, op.val);
        successCount++;
      } catch (error) {
        failures.push(op.regNo);
      }
      setSaveProgress({ current: i + 1, total: ops.length });
    }

    await queryClient.invalidateQueries({ queryKey: [] });
    setIsSaving(false);

    if (failures.length > 0) {
      toast.error(`Saved ${successCount}, but failed for ${failures.length} (${failures.join(", ")})`);
    } else {
      toast.success(`Successfully saved marks for ${successCount} student${successCount === 1 ? "" : "s"}`);
    }
  };
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !assessment) return;
    try {
      const result = await api.uploadMarksExcel(file, assessment.id);
      await queryClient.invalidateQueries({ queryKey: [] });
      await queryClient.invalidateQueries({ queryKey: [] });

      const inserted = Number(result.marksInserted ?? 0);
      const updated = Number(result.marksUpdated ?? 0);
      const failed = Number(result.failedCount ?? 0);
      const skipped = Number(result.skippedCount ?? 0);

      if (failed > 0 || skipped > 0) {
        console.warn("Marks import errors:", result.errors);
        
        let errorDetails = result.errors as ImportIssue[];
        if (result.skippedRegNos && Array.isArray(result.skippedRegNos) && result.skippedRegNos.length > 0) {
          const skippedIssue = {
            reason: `Unknown Register Numbers: ${result.skippedRegNos.join(", ")}`
          };
          errorDetails = [skippedIssue, ...errorDetails];
        }
        
        setImportErrors(errorDetails);
        setShowImportErrors(true);

        toast(
          `Import Successful. Marks Inserted: ${inserted}, Marks Updated: ${updated}, Skipped Rows: ${skipped}, Errors: ${failed}`,
          { style: { background: "#f8d7da", color: "#721c24" } },
        );
      } else {
        toast.success(`Import Successful. Marks Inserted: ${inserted}, Marks Updated: ${updated}, Skipped Rows: ${skipped}, Errors: ${failed}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not upload that file. Use the marks template.",
      );
    }
  };

  return (
    <RequireRole roles={["ADMIN", "STAFF"]}>
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
            <PencilRuler className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Marks Entry</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInput}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleImport}
          />
          <Button
            variant="outline"
            onClick={() => downloadMarksTemplate(assessment?.totalMarks ?? 100)}
          >
            <Download className="mr-2 h-4 w-4" />
            Template
          </Button>
          <Button
            variant="outline"
            disabled={!selected}
            onClick={() => fileInput.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
          <Button onClick={save} disabled={!selected || isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? `Saving (${saveProgress.current}/${saveProgress.total})...` : "Save Marks"}
          </Button>
        </div>
      </div>
      {importErrors.length > 0 && (
        <Card className="mb-5 border border-destructive/20 bg-destructive/5">
          <CardContent>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-destructive">Import errors detected</p>
                <p className="text-sm text-muted-foreground">
                  {importErrors.length} row{importErrors.length === 1 ? "" : "s"} failed.
                </p>
              </div>
              <Button variant="ghost" onClick={() => setShowImportErrors(true)}>
                View details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}


      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-end gap-6 p-5">
          <div className="w-full max-w-xs space-y-1.5">
            <Label>Select Assessment</Label>
            <Select value={selected} onValueChange={onSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.assessmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {assessment && (
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(assessment.dateConducted).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Marks</p>
                <p className="font-medium text-primary">{assessment.totalMarks}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selected && assessment ? (
        <Card>
          <CardContent className="p-0">
            {students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                      <th className="px-5 py-3 font-semibold">Student</th>
                      <th className="px-5 py-3 font-semibold">Reg No</th>
                      <th className="px-5 py-3 font-semibold">Department</th>
                      <th className="px-5 py-3 font-semibold">Marks Scored</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-accent text-primary">
                                {s.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs">{s.regNo}</td>
                        <td className="px-5 py-3">
                          <Badge variant="secondary">{s.department || "N/A"}</Badge>
                        </td>
                        <td className="px-5 py-3">
                          <Input
                            type="number"
                            min={0}
                            max={assessment.totalMarks}
                            value={draft[s.id] ?? ""}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, [s.id]: e.target.value }))
                            }
                            className="w-28"
                            placeholder={`/ ${assessment.totalMarks}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="No students to grade. Add students first." />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <EmptyState message="Select an assessment above to begin entering marks." />
          </CardContent>
        </Card>
      )}
    </div>
    </RequireRole>
  );
}
