import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Plus, Pencil, Trash2, Users, Search, Upload, Download } from "lucide-react";
import { api } from "@/lib/api";
import { useSMS } from "@/lib/sms-data";
import { downloadStudentTemplate } from "@/lib/excel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_BASE } from "@/lib/api";
import { CategoryBadge } from "@/components/sms/CategoryBadge";
import { EmptyState } from "@/components/sms/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

type ImportIssue = {
  row?: number;
  reason: string;
};


export const Route = createFileRoute("/students/")({
  head: () => ({
    meta: [
      { title: "Students — EduTrack" },
      { name: "description", content: "Manage student records and profiles." },
    ],
  }),
  component: StudentList,
});

function StudentList() {
  const { summaries, deleteStudent, deleteStudentsBulk, deleteAllStudents } = useSMS();
  const { isAdmin, isStaff } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<ImportIssue[]>([]);
  const [showImportErrors, setShowImportErrors] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const result = await api.uploadStudentsExcel(file);
      await queryClient.invalidateQueries();
      const inserted = Number(result.insertedCount ?? 0);
      const updated = Number(result.updatedCount ?? 0);
      const skipped = Number(result.skippedCount ?? 0);
      const failed = Number(result.failedCount ?? 0);
      const errors = (result.errors as ImportIssue[]) ?? [];
      setImportErrors(errors);
      setShowImportErrors(errors.length > 0);

      if (failed > 0) {
        toast(
          `Import Successful. Students Updated: ${updated}, Students Inserted: ${inserted}, Skipped Rows: ${skipped}, Errors: ${failed}`,
          { style: { background: "#f8d7da", color: "#721c24" } },
        );
      } else {
        toast.success(
          `Import Successful. Students Updated: ${updated}, Students Inserted: ${inserted}, Skipped Rows: ${skipped}, Errors: ${failed}`,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not upload that file. Use the Excel template.",
      );
    }
  };


  const filtered = summaries.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.regNo.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
            <Users className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(isAdmin || isStaff) && (
            <>
              <input
                ref={fileInput}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleImport}
              />
              {(isAdmin || isStaff) && selectedIds.size > 0 && (
                <Button variant="destructive" onClick={() => setShowBulkDeleteConfirm(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedIds.size})
                </Button>
              )}
              {(isAdmin || isStaff) && filtered.length > 0 && selectedIds.size === 0 && (
                <Button variant="destructive" onClick={() => setShowDeleteAllConfirm(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All
                </Button>
              )}
              <Button variant="outline" onClick={() => downloadStudentTemplate()}>
                <Download className="mr-2 h-4 w-4" />
                Template
              </Button>
              <Button variant="outline" onClick={() => fileInput.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Import Excel
              </Button>
              <Button onClick={() => navigate({ to: "/students/new" })}>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </>
          )}
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


      <Card>
        <CardContent className="p-0">
          <div className="p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, reg no or email"
                className="pl-9"
              />
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y bg-muted/50 text-left text-muted-foreground">
                    {(isAdmin || isStaff) && (
                      <th className="px-5 py-3 w-[40px]">
                        <input
                          type="checkbox"
                          checked={filtered.length > 0 && selectedIds.size === filtered.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(new Set(filtered.map((s) => s.id)));
                            } else {
                              setSelectedIds(new Set());
                            }
                          }}
                        />
                      </th>
                    )}
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">Reg No</th>
                    <th className="px-5 py-3 font-semibold">Department</th>
                    <th className="px-5 py-3 font-semibold">Year</th>
                    <th className="px-5 py-3 text-center font-semibold">Category</th>
                    {(isAdmin || isStaff) && <th className="px-5 py-3 text-center font-semibold">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b transition-colors hover:bg-muted/40">
                      {(isAdmin || isStaff) && (
                        <td className="px-5 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(s.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedIds);
                              if (e.target.checked) newSet.add(s.id);
                              else newSet.delete(s.id);
                              setSelectedIds(newSet);
                            }}
                          />
                        </td>
                      )}
                      <td className="px-5 py-3">
                        <Link
                          to="/students/$id"
                          params={{ id: s.id }}
                          className="flex items-center gap-3"
                        >
                          <Avatar className="h-9 w-9">
                            {s.profilePicUrl && (
                              <AvatarImage src={`${API_BASE}/api/students/${s.id}/photo`} alt={s.name} />
                            )}
                            <AvatarFallback className="bg-accent text-primary">
                              {s.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">{s.regNo}</td>
                      <td className="px-5 py-3">
                        <Badge variant="secondary">
                          {s.specialization || s.department || "N/A"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {s.pursuingYearLabel ? s.pursuingYearLabel : "—"}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <CategoryBadge category={s.category} />
                      </td>
                      {(isAdmin || isStaff) && (
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  navigate({ to: "/students/edit/$id", params: { id: s.id } })
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setToDelete(s.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              message="No students yet. Register your first student to get started."
              actionLabel="Add Student"
              onAction={() => navigate({ to: "/students/new" })}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the student and their marks. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) {
                  deleteStudent(toDelete);
                  toast.success("Student deleted");
                }
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} students?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected students and their marks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteStudentsBulk(Array.from(selectedIds).map(Number));
                setSelectedIds(new Set());
                setShowBulkDeleteConfirm(false);
                toast.success(`${selectedIds.size} students deleted`);
              }}
            >
              Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ALL students?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove ALL students and their marks from the system. This action cannot be undone!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                await deleteAllStudents();
                setSelectedIds(new Set());
                setShowDeleteAllConfirm(false);
                toast.success("All students deleted");
              }}
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showImportErrors} onOpenChange={setShowImportErrors}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import error details</AlertDialogTitle>
            <AlertDialogDescription>
              Review the rows that failed during Excel import.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-72 overflow-y-auto px-4 py-2">
            {importErrors.map((error, index) => (
              <div key={index} className="mb-3 rounded-lg border bg-white p-3 shadow-sm">
                <p className="text-sm font-medium">Row {error.row ?? "unknown"}</p>
                <p className="text-sm text-muted-foreground">{error.reason}</p>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowImportErrors(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
